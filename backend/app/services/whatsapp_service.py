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

        session_id = self._get_active_session_id(db)
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                # First check OpenWA health/sessions
                res = await client.get(
                    f"{self.base_url}/sessions/{session_id}",
                    headers=self._headers()
                )

                if res.status_code == 200:
                    data = res.json()
                    status_val = str(data.get("status", "")).lower()
                    is_ready = status_val in ["ready", "connected", "authenticated"]
                    return {
                        "connected": is_ready,
                        "status": status_val or "active",
                        "session_id": session_id,
                        "qr_code": data.get("qr") or data.get("qrcode"),
                        "details": f"Session {session_id} state: {status_val}",
                        "provider": "OpenWA"
                    }
                elif res.status_code == 404:
                    return {
                        "connected": False,
                        "status": "disconnected",
                        "session_id": session_id,
                        "qr_code": None,
                        "details": f"Session '{session_id}' not created yet. Click 'Connect WhatsApp' to start.",
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
                "session_id": session_id,
                "qr_code": None,
                "details": f"OpenWA Gateway is offline or unreachable at {self.base_url}. Start OpenWA or use SIMULATOR_MODE.",
                "provider": "OpenWA"
            }
        except Exception as e:
            return {
                "connected": False,
                "status": "error",
                "session_id": session_id,
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

        session_id = self._get_active_session_id(db)
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # 1. Create session if not exists
                create_res = await client.post(
                    f"{self.base_url}/sessions",
                    headers=self._headers(),
                    json={"name": session_id}
                )
                if create_res.status_code in (200, 201):
                    created_data = create_res.json()
                    new_id = created_data.get("sessionId") or created_data.get("id") or session_id
                    self._save_active_session_id(db, new_id)
                    session_id = new_id

                # 2. Start session
                start_res = await client.post(
                    f"{self.base_url}/sessions/{session_id}/start",
                    headers=self._headers()
                )

                # 3. Check for QR code
                qr_res = await client.get(
                    f"{self.base_url}/sessions/{session_id}/qr",
                    headers=self._headers()
                )
                qr_data = None
                if qr_res.status_code == 200:
                    if "application/json" in qr_res.headers.get("content-type", ""):
                        qr_data = qr_res.json().get("qr") or qr_res.json().get("qrcode")
                    else:
                        qr_data = qr_res.text

                return {
                    "success": True,
                    "status": "starting",
                    "session_id": session_id,
                    "qr_code": qr_data,
                    "message": "Session started. Scan QR code if displayed."
                }
        except Exception as e:
            return {
                "success": False,
                "status": "error",
                "session_id": session_id,
                "error": str(e)
            }

    async def get_qr_code(self, db: Session) -> Optional[str]:
        """Fetch latest QR code from OpenWA for companion linking."""
        if self.simulator_mode:
            # Return a valid sample SVG/base64 data placeholder for dev testing
            return "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PB08-TAXI-SIMULATED-OPENWA-QR"

        session_id = self._get_active_session_id(db)
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                res = await client.get(
                    f"{self.base_url}/sessions/{session_id}/qr",
                    headers=self._headers()
                )
                if res.status_code == 200:
                    if "application/json" in res.headers.get("content-type", ""):
                        return res.json().get("qr") or res.json().get("qrcode")
                    return res.text
        except Exception:
            pass
        return None

    async def disconnect_session(self, db: Session) -> Dict[str, Any]:
        """Disconnect and stop the OpenWA session."""
        if self.simulator_mode:
            return {"success": True, "message": "Disconnected (Simulator)"}

        session_id = self._get_active_session_id(db)
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
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
        session_id = self._get_active_session_id(db)

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
