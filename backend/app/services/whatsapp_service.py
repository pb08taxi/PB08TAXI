import re
import httpx
from typing import Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.config import get_settings
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

    def _headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["X-API-Key"] = self.api_key
        return headers

    def _get_active_session_id(self, db: Session) -> str:
        """Fetch saved session ID from system settings or default to session name."""
        setting = db.query(SystemSetting).filter(SystemSetting.key == "openwa_session_id").first()
        if setting and setting.value:
            return setting.value
        return self.session_name

    def _save_active_session_id(self, db: Session, session_id: str):
        setting = db.query(SystemSetting).filter(SystemSetting.key == "openwa_session_id").first()
        if not setting:
            setting = SystemSetting(key="openwa_session_id", value=session_id)
            db.add(setting)
        else:
            setting.value = session_id
        db.commit()

    async def _resolve_session_id(self, client: httpx.AsyncClient, db: Session) -> Optional[str]:
        """Resolve the active OpenWA session UUID, creating it if needed."""
        # 1. Check saved session ID from system settings
        saved_id = self._get_active_session_id(db)
        if saved_id and saved_id != self.session_name:
            check_res = await client.get(f"{self.base_url}/sessions/{saved_id}", headers=self._headers())
            if check_res.status_code == 200:
                return saved_id

        # 2. Query OpenWA by session name
        name_res = await client.get(f"{self.base_url}/sessions?name={self.session_name}", headers=self._headers())
        if name_res.status_code == 200:
            sessions = name_res.json()
            if isinstance(sessions, list) and len(sessions) > 0:
                session_uuid = sessions[0].get("id")
                if session_uuid:
                    self._save_active_session_id(db, session_uuid)
                    return session_uuid

        # 3. If no session exists by name, create one
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

        return None

    async def get_status(self, db: Session) -> Dict[str, Any]:
        """Check the live connection status with OpenWA Gateway."""
        if self.simulator_mode:
            return {
                "connected": True,
                "status": "ready (simulator)",
                "session_id": "simulated-session-001",
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
                    qr_code = None

                    # If status is qr_ready or created, attempt to fetch the QR code
                    if not is_ready:
                        qr_res = await client.get(
                            f"{self.base_url}/sessions/{session_id}/qr",
                            headers=self._headers()
                        )
                        if qr_res.status_code == 200:
                            qr_json = qr_res.json() if "application/json" in qr_res.headers.get("content-type", "") else {}
                            qr_code = qr_json.get("qrCode") or qr_json.get("qr") or qr_json.get("qrcode") or qr_res.text

                    return {
                        "connected": is_ready,
                        "status": status_val or "active",
                        "session_id": session_id,
                        "qr_code": qr_code,
                        "details": f"Session {self.session_name} ({session_id[:8]}...) state: {status_val}",
                        "provider": "OpenWA"
                    }
                elif res.status_code == 404:
                    return {
                        "connected": False,
                        "status": "disconnected",
                        "session_id": session_id,
                        "qr_code": None,
                        "details": f"Session '{self.session_name}' not active. Click 'Connect WhatsApp' to start.",
                        "provider": "OpenWA"
                    }
                else:
                    return {
                        "connected": False,
                        "status": f"http_error_{res.status_code}",
                        "session_id": session_id,
                        "qr_code": None,
                        "details": res.text,
                        "provider": "OpenWA"
                    }
        except httpx.ConnectError:
            return {
                "connected": False,
                "status": "gateway_offline",
                "session_id": None,
                "qr_code": None,
                "details": f"OpenWA Gateway is offline or unreachable at {self.base_url}.",
                "provider": "OpenWA"
            }
        except Exception as e:
            return {
                "connected": False,
                "status": "error",
                "session_id": None,
                "qr_code": None,
                "details": str(e),
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

                # Start session
                start_res = await client.post(
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

    async def disconnect_session(self, db: Session) -> Dict[str, Any]:
        """Disconnect and stop the OpenWA session."""
        if self.simulator_mode:
            return {"success": True, "message": "Disconnected (Simulator)"}

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                session_id = await self._resolve_session_id(client, db)
                if not session_id:
                    return {"success": False, "error": "No active session found"}
                res = await client.post(
                    f"{self.base_url}/sessions/{session_id}/stop",
                    headers=self._headers()
                )
                return {
                    "success": res.status_code in (200, 204),
                    "message": "Session stopped successfully" if res.status_code in (200, 204) else res.text
                }
        except Exception as e:
            return {"success": False, "error": str(e)}

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

        # Create pending message log in Neon DB
        log_entry = WhatsAppMessage(
            customer_id=customer_id,
            phone=phone,
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
            async with httpx.AsyncClient(timeout=10.0) as client:
                session_id = await self._resolve_session_id(client, db)
                if not session_id:
                    err = "OpenWA session not initialized"
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
            error_msg = f"Delivery error: {str(e)}"
            log_entry.status = "FAILED"
            log_entry.error_detail = error_msg
            db.commit()
            return False, error_msg

whatsapp_service = WhatsAppService()
