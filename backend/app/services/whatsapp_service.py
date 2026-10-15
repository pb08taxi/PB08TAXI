import re
import time
import asyncio
import httpx
from typing import Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.config import get_settings
from app.database import SessionLocal
from app.models import WhatsAppMessage, Customer, SystemSetting

settings = get_settings()

def format_whatsapp_chat_id(phone: str) -> str:
    """Format a phone number into WhatsApp chatId (e.g., 919876543210@c.us)."""
    clean_digits = re.sub(r"\D", "", phone)
    # Default to 91 (India) prefix if standard 10 digit mobile is provided
    if len(clean_digits) == 10:
        clean_digits = "91" + clean_digits
    return f"{clean_digits}@c.us"

class WhatsAppService:
    def __init__(self):
        self.base_url = settings.OPENWA_BASE_URL.rstrip("/")
        self.api_key = settings.OPENWA_API_KEY
        self.session_name = settings.OPENWA_SESSION_NAME
        self.simulator_mode = settings.OPENWA_SIMULATOR_MODE
        self._cached_session_id = None
        self._session_cache_timestamp = 0

    def _headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["X-API-Key"] = self.api_key
        return headers

    def _get_setting(self, db: Session, key: str, default: str = "") -> str:
        s = db.query(SystemSetting).filter(SystemSetting.key == key).first()
        return s.value if s and s.value is not None else default

    def _set_setting(self, db: Session, key: str, val: str):
        s = db.query(SystemSetting).filter(SystemSetting.key == key).first()
        if not s:
            s = SystemSetting(key=key, value=val)
            db.add(s)
        else:
            s.value = val
        db.commit()

    def _get_active_session_id(self, db: Session) -> str:
        """Fetch saved session ID from system settings or default to session name."""
        return self._get_setting(db, "openwa_session_id", self.session_name)

    def _save_active_session_id(self, db: Session, session_id: str):
        self._cached_session_id = session_id
        self._session_cache_timestamp = time.time()
        self._set_setting(db, "openwa_session_id", session_id)

    async def _resolve_session_id(self, client: httpx.AsyncClient, db: Session, force_refresh: bool = False) -> Optional[str]:
        """Resolve the active OpenWA session UUID, prioritizing connected sessions with in-memory caching."""
        now = time.time()
        if not force_refresh and self._cached_session_id and (now - self._session_cache_timestamp < 600):
            return self._cached_session_id

        # 1. Check saved session ID from system settings
        saved_id = self._get_active_session_id(db)
        if saved_id and saved_id != self.session_name:
            try:
                check_res = await client.get(f"{self.base_url}/sessions/{saved_id}", headers=self._headers())
                if check_res.status_code == 200:
                    s_data = check_res.json()
                    if s_data.get("status") in ("ready", "connected", "authenticated"):
                        self._cached_session_id = saved_id
                        self._session_cache_timestamp = now
                        return saved_id
            except Exception:
                pass

        # 2. Query all sessions on OpenWA gateway to see if one is already ready/authenticated
        try:
            list_res = await client.get(f"{self.base_url}/sessions", headers=self._headers())
            if list_res.status_code == 200:
                sessions = list_res.json()
                if isinstance(sessions, list) and len(sessions) > 0:
                    # Prefer any session that is already 'ready'
                    for s in sessions:
                        if s.get("status") in ("ready", "connected", "authenticated"):
                            sid = s.get("id")
                            if sid:
                                self._save_active_session_id(db, sid)
                                return sid
                    # Otherwise match by configured session name
                    for s in sessions:
                        if s.get("name") == self.session_name:
                            sid = s.get("id")
                            if sid:
                                self._save_active_session_id(db, sid)
                                return sid
                    # Fallback to first existing session
                    first_id = sessions[0].get("id")
                    if first_id:
                        self._save_active_session_id(db, first_id)
                        return first_id
        except Exception:
            pass

        # 3. If no session exists, create one
        try:
            create_res = await client.post(
                f"{self.base_url}/sessions",
                headers=self._headers(),
                json={"name": self.session_name}
            )
            if create_res.status_code in (200, 201):
                session_uuid = create_res.json().get("id")
                if session_uuid:
                    self._save_active_session_id(db, session_uuid)
                    return session_uuid
        except Exception:
            pass

        return None

    async def get_status(self, db: Session) -> Dict[str, Any]:
        """Check the live connection status with OpenWA Gateway."""
        if self.simulator_mode:
            return {
                "connected": True,
                "status": "ready",
                "session_id": "simulated-session-001",
                "phone": "919876543210",
                "qr_code": None,
                "details": "Running in OpenWA Simulator Mode. All messages are safely logged.",
                "provider": "OpenWA"
            }

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                session_id = await self._resolve_session_id(client, db)
                if not session_id:
                    return {
                        "connected": False,
                        "status": "not_configured",
                        "session_id": None,
                        "phone": None,
                        "qr_code": None,
                        "details": "Could not locate or initialize session on OpenWA gateway.",
                        "provider": "OpenWA"
                    }

                res = await client.get(
                    f"{self.base_url}/sessions/{session_id}",
                    headers=self._headers()
                )

                if res.status_code == 200:
                    data = res.json()
                    status_val = str(data.get("status", "")).lower()
                    is_ready = status_val in ["ready", "connected", "authenticated"]
                    phone = data.get("phone")
                    qr_code = None

                    # If not connected and user didn't explicitly log out, auto-attempt session reconnect
                    if not is_ready:
                        is_logged_out = self._get_setting(db, "openwa_user_logged_out", "false") == "true"
                        if not is_logged_out and status_val in ("stopped", "inactive", "disconnected", "failed"):
                            try:
                                await client.post(f"{self.base_url}/sessions/{session_id}/start", headers=self._headers())
                                await asyncio.sleep(1.2)
                                re_res = await client.get(f"{self.base_url}/sessions/{session_id}", headers=self._headers())
                                if re_res.status_code == 200:
                                    data = re_res.json()
                                    status_val = str(data.get("status", "")).lower()
                                    is_ready = status_val in ["ready", "connected", "authenticated"]
                                    phone = data.get("phone")
                            except Exception:
                                pass

                    # If not connected, fetch the companion QR code
                    if not is_ready:
                        qr_res = await client.get(
                            f"{self.base_url}/sessions/{session_id}/qr",
                            headers=self._headers()
                        )
                        if qr_res.status_code == 200:
                            qr_json = qr_res.json() if "application/json" in qr_res.headers.get("content-type", "") else {}
                            qr_code = qr_json.get("qrCode") or qr_json.get("qr") or qr_json.get("qrcode") or qr_res.text

                    phone_text = f" | Linked Phone: +{phone}" if phone else ""
                    return {
                        "connected": is_ready,
                        "status": status_val or "active",
                        "session_id": session_id,
                        "phone": phone,
                        "qr_code": qr_code if not is_ready else None,
                        "details": f"Session ({session_id[:8]}...) state: {status_val}{phone_text}",
                        "provider": "OpenWA"
                    }
                elif res.status_code == 404:
                    return {
                        "connected": False,
                        "status": "disconnected",
                        "session_id": session_id,
                        "phone": None,
                        "qr_code": None,
                        "details": f"Session '{self.session_name}' not active. Click 'Connect WhatsApp' to start.",
                        "provider": "OpenWA"
                    }
                else:
                    return {
                        "connected": False,
                        "status": f"http_error_{res.status_code}",
                        "session_id": session_id,
                        "phone": None,
                        "qr_code": None,
                        "details": res.text,
                        "provider": "OpenWA"
                    }
        except httpx.ConnectError:
            return {
                "connected": False,
                "status": "gateway_offline",
                "session_id": None,
                "phone": None,
                "qr_code": None,
                "details": f"OpenWA Gateway is offline or unreachable at {self.base_url}.",
                "provider": "OpenWA"
            }
        except Exception as e:
            return {
                "connected": False,
                "status": "error",
                "session_id": None,
                "phone": None,
                "qr_code": None,
                "details": str(e) or type(e).__name__,
                "provider": "OpenWA"
            }

    async def connect_session(self, db: Session) -> Dict[str, Any]:
        """Start or create an OpenWA session and request QR code."""
        if self.simulator_mode:
            return {
                "success": True,
                "status": "connected",
                "session_id": "simulated-session-001",
                "message": "Connected successfully in Simulator Mode"
            }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                session_id = await self._resolve_session_id(client, db)
                if not session_id:
                    return {
                        "success": False,
                        "status": "error",
                        "error": "Failed to create or find session on OpenWA gateway."
                    }

                # Clear explicit logout flag so background auto-reconnect stays active
                self._set_setting(db, "openwa_user_logged_out", "false")

                # Start session engine
                await client.post(
                    f"{self.base_url}/sessions/{session_id}/start",
                    headers=self._headers()
                )

                # Fetch QR code
                qr_code = None
                qr_res = await client.get(
                    f"{self.base_url}/sessions/{session_id}/qr",
                    headers=self._headers()
                )
                if qr_res.status_code == 200:
                    qr_json = qr_res.json() if "application/json" in qr_res.headers.get("content-type", "") else {}
                    qr_code = qr_json.get("qrCode") or qr_json.get("qr") or qr_json.get("qrcode") or qr_res.text

                return {
                    "success": True,
                    "status": "starting",
                    "session_id": session_id,
                    "qr_code": qr_code,
                    "message": "Session started. Scan the companion QR code to connect."
                }
        except Exception as e:
            return {
                "success": False,
                "status": "error",
                "session_id": None,
                "error": str(e)
            }

    async def refresh_qr(self, db: Session) -> Dict[str, Any]:
        """Refresh companion QR code by triggering session start and fetching fresh QR."""
        if self.simulator_mode:
            return {
                "success": True,
                "status": "qr_ready",
                "qr_code": "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PB08-TAXI-SIMULATED-REFRESHED-QR",
                "message": "QR refreshed successfully (Simulator)"
            }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                session_id = await self._resolve_session_id(client, db)
                if not session_id:
                    return {"success": False, "error": "No active session found on OpenWA gateway."}

                # Trigger engine start to ensure QR generation
                await client.post(
                    f"{self.base_url}/sessions/{session_id}/start",
                    headers=self._headers()
                )

                # Fetch latest QR code
                qr_res = await client.get(
                    f"{self.base_url}/sessions/{session_id}/qr",
                    headers=self._headers()
                )
                qr_code = None
                if qr_res.status_code == 200:
                    qr_json = qr_res.json() if "application/json" in qr_res.headers.get("content-type", "") else {}
                    qr_code = qr_json.get("qrCode") or qr_json.get("qr") or qr_json.get("qrcode") or qr_res.text

                return {
                    "success": True,
                    "status": "qr_ready" if qr_code else "starting",
                    "session_id": session_id,
                    "qr_code": qr_code,
                    "message": "QR code refreshed successfully." if qr_code else "Session engine restarting, please wait a moment."
                }
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def get_qr_code(self, db: Session) -> Optional[str]:
        """Fetch latest QR code from OpenWA for companion linking."""
        if self.simulator_mode:
            return "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PB08-TAXI-SIMULATED-OPENWA-QR"

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                session_id = await self._resolve_session_id(client, db)
                if not session_id:
                    return None
                res = await client.get(
                    f"{self.base_url}/sessions/{session_id}/qr",
                    headers=self._headers()
                )
                if res.status_code == 200:
                    if "application/json" in res.headers.get("content-type", ""):
                        data = res.json()
                        return data.get("qrCode") or data.get("qr") or data.get("qrcode")
                    return res.text
        except Exception:
            pass
        return None

    async def logout_session(self, db: Session) -> Dict[str, Any]:
        """Unlink WhatsApp account from companion web and stop the session."""
        if self.simulator_mode:
            return {"success": True, "message": "WhatsApp logged out successfully (Simulator)"}

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                session_id = await self._resolve_session_id(client, db)
                if not session_id:
                    return {"success": False, "error": "No active session found"}

                # Mark explicit logout so auto-reconnect does not fire until user clicks connect again
                self._set_setting(db, "openwa_user_logged_out", "true")

                # 1. Unlink companion account
                try:
                    await client.post(
                        f"{self.base_url}/sessions/{session_id}/logout",
                        headers=self._headers()
                    )
                except Exception:
                    pass

                # 2. Stop session container
                try:
                    await client.post(
                        f"{self.base_url}/sessions/{session_id}/stop",
                        headers=self._headers()
                    )
                except Exception:
                    pass

                return {
                    "success": True,
                    "message": "WhatsApp session logged out and disconnected successfully."
                }
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def disconnect_session(self, db: Session) -> Dict[str, Any]:
        """Disconnect and stop or logout the OpenWA session."""
        return await self.logout_session(db)

    async def send_text_message(
        self,
        db: Session,
        phone: str,
        message: str,
        message_type: str = "BOOKING_CONFIRMATION",
        customer_id: Optional[int] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Send text message via OpenWA and record audit log in Neon DB.
        Returns: (success: bool, error_detail: Optional[str])
        """
        chat_id = format_whatsapp_chat_id(phone)

        # Ensure phone has + prefix for database audit log
        norm_phone = phone.strip()
        if not norm_phone.startswith("+"):
            digits = re.sub(r"\D", "", norm_phone)
            if len(digits) == 10:
                norm_phone = f"+91{digits}"
            elif len(digits) == 12 and digits.startswith("91"):
                norm_phone = f"+{digits}"
            elif digits:
                norm_phone = f"+{digits}"

        # Create pending message log in Neon DB
        log_entry = WhatsAppMessage(
            customer_id=customer_id,
            phone=norm_phone,
            message_type=message_type,
            content=message,
            status="PENDING"
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)

        if self.simulator_mode:
            log_entry.status = "SENT"
            log_entry.error_detail = "Simulated delivery (Simulator Mode)"
            db.commit()
            return True, None

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                session_id = await self._resolve_session_id(client, db)
                if not session_id:
                    err = "OpenWA session not initialized on gateway. Please verify WhatsApp connection in admin panel."
                    log_entry.status = "FAILED"
                    log_entry.error_detail = err
                    db.commit()
                    return False, err

                endpoint = f"{self.base_url}/sessions/{session_id}/messages/send-text"
                payload = {
                    "chatId": chat_id,
                    "text": message
                }
                res = await client.post(
                    endpoint,
                    headers=self._headers(),
                    json=payload
                )

                # If session was expired/not found, invalidate cache and retry once
                if res.status_code == 404:
                    self._cached_session_id = None
                    session_id = await self._resolve_session_id(client, db, force_refresh=True)
                    if session_id:
                        res = await client.post(
                            f"{self.base_url}/sessions/{session_id}/messages/send-text",
                            headers=self._headers(),
                            json=payload
                        )

                if res.status_code in (200, 201):
                    log_entry.status = "SENT"
                    log_entry.error_detail = None
                    db.commit()
                    return True, None
                else:
                    error_msg = f"HTTP {res.status_code}: {res.text}"
                    log_entry.status = "FAILED"
                    log_entry.error_detail = error_msg
                    db.commit()
                    return False, error_msg
        except Exception as e:
            error_msg = f"Delivery error: {str(e) or type(e).__name__}"
            log_entry.status = "FAILED"
            log_entry.error_detail = error_msg
            db.commit()
            return False, error_msg

    async def send_location_message(
        self,
        db: Session,
        phone: str,
        latitude: float,
        longitude: float,
        address: str = "Passenger Pickup Location",
        description: str = "PB08 TAXI",
        message_type: str = "LOCATION_PIN",
        customer_id: Optional[int] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Send native WhatsApp location card via OpenWA and record audit log in Neon DB.
        Allows instant tap-to-navigate in Google Maps directly from WhatsApp!
        """
        chat_id = format_whatsapp_chat_id(phone)

        norm_phone = phone.strip()
        if not norm_phone.startswith("+"):
            digits = re.sub(r"\D", "", norm_phone)
            if len(digits) == 10:
                norm_phone = f"+91{digits}"
            elif digits:
                norm_phone = f"+{digits}"

        maps_link = f"https://www.google.com/maps/dir/?api=1&destination={latitude:.6f},{longitude:.6f}&travelmode=driving"
        log_entry = WhatsAppMessage(
            customer_id=customer_id,
            phone=norm_phone,
            message_type=message_type,
            content=f"📍 GPS Location Navigation: {latitude:.6f}, {longitude:.6f} ({address}) — {maps_link}",
            status="PENDING"
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)

        if self.simulator_mode:
            log_entry.status = "SENT"
            log_entry.error_detail = "Simulated location pin delivery (Simulator Mode)"
            db.commit()
            return True, None

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                session_id = await self._resolve_session_id(client, db)
                if not session_id:
                    err = "OpenWA session not initialized on gateway. Please verify WhatsApp connection in admin panel."
                    log_entry.status = "FAILED"
                    log_entry.error_detail = err
                    db.commit()
                    return False, err

                endpoint = f"{self.base_url}/sessions/{session_id}/messages/send-location"
                payload = {
                    "chatId": chat_id,
                    "latitude": latitude,
                    "longitude": longitude,
                    "address": address or "Pickup Location",
                    "description": description or "PB08 TAXI"
                }
                res = await client.post(
                    endpoint,
                    headers=self._headers(),
                    json=payload
                )

                if res.status_code == 404:
                    self._cached_session_id = None
                    session_id = await self._resolve_session_id(client, db, force_refresh=True)
                    if session_id:
                        res = await client.post(
                            f"{self.base_url}/sessions/{session_id}/messages/send-location",
                            headers=self._headers(),
                            json=payload
                        )

                if res.status_code in (200, 201):
                    log_entry.status = "SENT"
                    log_entry.error_detail = None
                    db.commit()
                    return True, None
                else:
                    error_msg = f"HTTP {res.status_code}: {res.text}"
                    log_entry.status = "FAILED"
                    log_entry.error_detail = error_msg
                    db.commit()
                    return False, error_msg
        except Exception as e:
            error_msg = f"Location delivery error: {str(e) or type(e).__name__}"
            log_entry.status = "FAILED"
            log_entry.error_detail = error_msg
            db.commit()
            return False, error_msg

whatsapp_service = WhatsAppService()

async def send_background_message(
    phone: str,
    message: str,
    message_type: str = "BOOKING_CONFIRMATION",
    customer_id: Optional[int] = None
):
    """
    Safely dispatch a WhatsApp message in an asynchronous background worker.
    Creates a dedicated DB session to log the delivery status and closes it cleanly.
    This guarantees zero blocking latency for frontend API responses!
    """
    db = SessionLocal()
    try:
        await whatsapp_service.send_text_message(
            db=db,
            phone=phone,
            message=message,
            message_type=message_type,
            customer_id=customer_id
        )
    except Exception as e:
        print(f"[PB08 TAXI Background WhatsApp Error] {e}")
    finally:
        db.close()

async def send_background_location_message(
    phone: str,
    latitude: float,
    longitude: float,
    address: str = "Passenger Pickup Location",
    description: str = "PB08 TAXI",
    message_type: str = "LOCATION_PIN",
    customer_id: Optional[int] = None
):
    """
    Safely dispatch a native WhatsApp GPS location pin in background worker.
    """
    db = SessionLocal()
    try:
        await whatsapp_service.send_location_message(
            db=db,
            phone=phone,
            latitude=latitude,
            longitude=longitude,
            address=address,
            description=description,
            message_type=message_type,
            customer_id=customer_id
        )
    except Exception as e:
        print(f"[PB08 TAXI Background Location Pin Error] {e}")
    finally:
        db.close()

