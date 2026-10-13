import asyncio
import re
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AdminUser, Customer, WhatsAppMessage, SystemSetting, MessageTemplate
from app.schemas import (
    WhatsAppStatusOut,
    WhatsAppTestMessage,
    DirectChatMessageIn,
    WhatsAppOfferRequest,
    WhatsAppMessageOut,
    WhatsAppSettingsIn,
    WhatsAppSettingsOut,
    MessageTemplateOut,
    MessageTemplateUpdate
)
from app.services.whatsapp_service import whatsapp_service
from app.security import get_current_admin

router = APIRouter(prefix="/admin/whatsapp", tags=["Admin WhatsApp"])

@router.get("/status", response_model=WhatsAppStatusOut)
async def get_whatsapp_status(
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retrieve live status from the configured OpenWA WhatsApp gateway."""
    data = await whatsapp_service.get_status(db)
    return WhatsAppStatusOut(
        connected=data.get("connected", False),
        status=data.get("status", "unknown"),
        session_id=data.get("session_id"),
        phone=data.get("phone"),
        qr_code=data.get("qr_code"),
        details=data.get("details"),
        provider=data.get("provider", "OpenWA")
    )

@router.post("/connect")
async def connect_whatsapp_session(
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Start or create the OpenWA WhatsApp session to begin pairing / connecting."""
    result = await whatsapp_service.connect_session(db)
    return result

@router.post("/refresh-qr")
async def refresh_whatsapp_qr(
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Force session start or refresh to generate a fresh QR code."""
    result = await whatsapp_service.refresh_qr(db)
    return result

@router.get("/qr")
async def get_whatsapp_qr(
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Fetch companion QR code from OpenWA for scanning."""
    qr_code = await whatsapp_service.get_qr_code(db)
    if not qr_code:
        # Check overall status
        status_info = await whatsapp_service.get_status(db)
        return {
            "qr_code": None,
            "status": status_info.get("status"),
            "connected": status_info.get("connected", False),
            "message": "QR code is not currently pending or session is already authenticated."
        }
    return {
        "qr_code": qr_code,
        "status": "qr_ready",
        "connected": False
    }

@router.post("/disconnect")
async def disconnect_whatsapp(
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Disconnect and unlink the OpenWA WhatsApp session."""
    result = await whatsapp_service.disconnect_session(db)
    return result

@router.post("/logout")
async def logout_whatsapp(
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Unlink companion account and disconnect OpenWA WhatsApp session."""
    result = await whatsapp_service.logout_session(db)
    return result

@router.get("/settings", response_model=WhatsAppSettingsOut)
def get_whatsapp_admin_settings(
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Fetch admin new booking alert WhatsApp settings."""
    phone_setting = db.query(SystemSetting).filter(SystemSetting.key == "admin_alert_whatsapp_number").first()
    enabled_setting = db.query(SystemSetting).filter(SystemSetting.key == "admin_alert_whatsapp_enabled").first()
    
    phone_val = phone_setting.value if phone_setting and phone_setting.value else None
    enabled_val = True
    if enabled_setting and enabled_setting.value is not None:
        enabled_val = enabled_setting.value.lower() in ("true", "1", "yes")

    return WhatsAppSettingsOut(
        admin_alert_whatsapp_number=phone_val,
        admin_alert_whatsapp_enabled=enabled_val
    )

@router.post("/settings", response_model=WhatsAppSettingsOut)
def update_whatsapp_admin_settings(
    payload: WhatsAppSettingsIn,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update admin new booking alert WhatsApp settings."""
    phone_val = payload.admin_alert_whatsapp_number.strip() if payload.admin_alert_whatsapp_number else ""
    phone_setting = db.query(SystemSetting).filter(SystemSetting.key == "admin_alert_whatsapp_number").first()
    if not phone_setting:
        phone_setting = SystemSetting(key="admin_alert_whatsapp_number", value=phone_val)
        db.add(phone_setting)
    else:
        phone_setting.value = phone_val
        phone_setting.updated_at = datetime.utcnow()

    enabled_val = "true" if payload.admin_alert_whatsapp_enabled else "false"
    enabled_setting = db.query(SystemSetting).filter(SystemSetting.key == "admin_alert_whatsapp_enabled").first()
    if not enabled_setting:
        enabled_setting = SystemSetting(key="admin_alert_whatsapp_enabled", value=enabled_val)
        db.add(enabled_setting)
    else:
        enabled_setting.value = enabled_val
        enabled_setting.updated_at = datetime.utcnow()

    db.commit()

    return WhatsAppSettingsOut(
        admin_alert_whatsapp_number=phone_val or None,
        admin_alert_whatsapp_enabled=payload.admin_alert_whatsapp_enabled
    )

@router.post("/test-message")
async def send_test_whatsapp_message(
    payload: WhatsAppTestMessage,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Send a test WhatsApp message to verify gateway connectivity and delivery."""
    test_text = payload.message or "PB08 TAXI: Test message from your admin control panel. WhatsApp connection is working perfectly!"
    success, error = await whatsapp_service.send_text_message(
        db=db,
        phone=payload.phone,
        message=test_text,
        message_type="TEST_MESSAGE"
    )
    if not success:
        return {
            "success": False,
            "message": "Failed to deliver WhatsApp message via OpenWA",
            "error": error
        }
    return {
        "success": True,
        "message": f"Test message dispatched successfully to {payload.phone} via OpenWA"
    }

@router.post("/chat/send")
async def send_direct_chat_message(
    payload: DirectChatMessageIn,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Dispatch a direct WhatsApp chat message to a customer or driver via OpenWA."""
    role_suffix = (payload.recipient_role or "CHAT").upper()
    message_type = f"CHAT_{role_suffix}"
    success, error = await whatsapp_service.send_text_message(
        db=db,
        phone=payload.phone,
        message=payload.message,
        message_type=message_type,
        customer_id=payload.customer_id
    )
    if not success:
        return {
            "success": False,
            "message": "Failed to deliver WhatsApp message via OpenWA",
            "error": error
        }
    return {
        "success": True,
        "message": f"Message dispatched successfully to {payload.phone} via OpenWA",
        "phone": payload.phone,
        "sent_at": datetime.now(timezone.utc).isoformat()
    }

@router.get("/chat/history", response_model=List[WhatsAppMessageOut])
def get_direct_chat_history(
    phone: str = Query(..., min_length=5),
    limit: int = Query(30, ge=1, le=100),
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retrieve message history for this specific customer/driver phone number."""
    clean_digits = re.sub(r"\D", "", phone)
    last_10 = clean_digits[-10:] if len(clean_digits) >= 10 else clean_digits
    query = db.query(WhatsAppMessage).filter(
        WhatsAppMessage.phone.like(f"%{last_10}%")
    ).order_by(WhatsAppMessage.sent_at.desc()).limit(limit)
    logs = query.all()
    # Reverse so messages are chronological (oldest to newest)
    return list(reversed(logs))

@router.get("/offers/eligible-count")
def get_eligible_offer_customers_count(
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get the count of customers who have given marketing consent and are eligible for offers."""
    eligible_count = db.query(Customer).filter(Customer.marketing_consent == True).count()
    total_customers = db.query(Customer).count()
    return {
        "eligible_customers": eligible_count,
        "opted_out_customers": total_customers - eligible_count,
        "total_customers": total_customers
    }

@router.post("/offers/send")
async def send_promotional_offer(
    payload: WhatsAppOfferRequest,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Send promotional offer strictly to customers with verified marketing consent.
    Includes rate-pacing delays to respect WhatsApp anti-spam safeguards.
    """
    eligible_customers = (
        db.query(Customer)
        .filter(Customer.marketing_consent == True)
        .order_by(Customer.created_at.desc())
        .all()
    )

    if not eligible_customers:
        return {
            "success": True,
            "sent_count": 0,
            "failed_count": 0,
            "message": "No eligible customers found with marketing consent."
        }

    sent_count = 0
    failed_count = 0
    failures = []

    for cust in eligible_customers:
        # Personalize if applicable
        personalized = payload.message.replace("{Customer Name}", cust.name).replace("{name}", cust.name)
        success, error = await whatsapp_service.send_text_message(
            db=db,
            phone=cust.whatsapp_number,
            message=personalized,
            message_type="PROMOTIONAL_OFFER",
            customer_id=cust.id
        )
        if success:
            sent_count += 1
        else:
            failed_count += 1
            failures.append({"phone": cust.whatsapp_number, "error": error})

        # Pacing delay between sends to prevent trigger of WhatsApp spam thresholds
        await asyncio.sleep(0.6)

    return {
        "success": True,
        "total_attempted": len(eligible_customers),
        "sent_count": sent_count,
        "failed_count": failed_count,
        "failures": failures[:10]  # First 10 error samples if any
    }

@router.get("/logs", response_model=List[WhatsAppMessageOut])
def get_whatsapp_message_logs(
    limit: int = Query(50, ge=1, le=200),
    message_type: Optional[str] = Query(None),
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retrieve audit history of dispatched WhatsApp messages."""
    query = db.query(WhatsAppMessage)
    if message_type:
        query = query.filter(WhatsAppMessage.message_type == message_type)
    
    logs = query.order_by(WhatsAppMessage.sent_at.desc()).limit(limit).all()
    return logs

DEFAULT_TEMPLATES = [
    {
        "template_key": "booking_received",
        "title": "Booking Received (Customer Acknowledgment)",
        "content": (
            "🚖 *PB08 TAXI — Booking Received*\n"
            "Hi {customer_name}, thank you for choosing PB08 TAXI!\n"
            "We have received your booking request (Ref: #{booking_ref}).\n"
            "🚘 *Preferred Car:* {car_name}\n"
            "📅 *Pickup Date:* {pickup_date}\n"
            "⏰ *Pickup Time:* {pickup_time}\n"
            "📍 *Pickup Location:* {pickup_location}\n"
            "🏁 *Destination:* {destination}\n\n"
            "Our team will contact you shortly to confirm your ride. For immediate assistance call {support_phone}."
        ),
        "variables_hint": "{customer_name}, {booking_ref}, {car_name}, {pickup_date}, {pickup_time}, {pickup_location}, {destination}, {support_phone}"
    },
    {
        "template_key": "booking_confirmed",
        "title": "Booking Confirmed — Driver Assigned (To Customer)",
        "content": (
            "🚖 *PB08 TAXI — Ride Confirmed!*\n"
            "Hello {customer_name}, your ride has been confirmed!\n"
            "📌 *Booking Ref:* #{booking_ref}\n"
            "📅 *Pickup Date:* {pickup_date}\n"
            "⏰ *Pickup Time:* {pickup_time}\n"
            "📍 *Pickup Location:* {pickup_location}\n"
            "🏁 *Destination:* {destination}\n\n"
            "🚗 *Assigned Cab & Driver Details:*\n"
            "👤 *Driver Name:* {driver_name}\n"
            "🚘 *Car Model:* {car_name}\n"
            "🚖 *Taxi No:* {taxi_number}\n"
            "📞 *Driver Contact:* {driver_contact}\n\n"
            "Your driver will arrive on time. Have a safe journey!"
        ),
        "variables_hint": "{customer_name}, {booking_ref}, {pickup_date}, {pickup_time}, {pickup_location}, {destination}, {driver_name}, {car_name}, {taxi_number}, {driver_contact}, {support_phone}"
    },
    {
        "template_key": "driver_assignment",
        "title": "Duty Assignment Alert (To Driver)",
        "content": (
            "🚖 *PB08 TAXI — New Duty Assigned!*\n"
            "Hello {driver_name}, a new booking has been assigned to your cab ({car_name} - {taxi_number}):\n"
            "📌 *Booking Ref:* #{booking_ref}\n"
            "👤 *Customer Name:* {customer_name}\n"
            "📞 *Customer Contact:* {customer_contact}\n"
            "📅 *Pickup Date:* {pickup_date}\n"
            "⏰ *Pickup Time:* {pickup_time}\n"
            "📍 *Pickup Location:* {pickup_location}\n"
            "🏁 *Destination:* {destination}\n\n"
            "👉 Please call the customer in advance to coordinate pickup."
        ),
        "variables_hint": "{driver_name}, {car_name}, {taxi_number}, {booking_ref}, {customer_name}, {customer_contact}, {pickup_date}, {pickup_time}, {pickup_location}, {destination}"
    },
    {
        "template_key": "booking_completed",
        "title": "Ride Completed (To Customer)",
        "content": (
            "🚖 *PB08 TAXI — Ride Completed!*\n"
            "Dear {customer_name}, your journey (Ref: #{booking_ref}) has ended.\n"
            "Thank you for riding with PB08 TAXI! We hope you had a pleasant and safe ride.\n\n"
            "For your next ride, call us anytime at {support_phone}. Have a great day!"
        ),
        "variables_hint": "{customer_name}, {booking_ref}, {support_phone}"
    },
    {
        "template_key": "booking_cancelled",
        "title": "Booking Cancelled (To Customer)",
        "content": (
            "🚖 *PB08 TAXI — Booking Cancelled*\n"
            "Hello {customer_name}, your taxi booking (Ref: #{booking_ref}) has been cancelled.\n"
            "Reason: {notes}\n\n"
            "If you have any questions or wish to book again, please call {support_phone}."
        ),
        "variables_hint": "{customer_name}, {booking_ref}, {notes}, {support_phone}"
    }
]

@router.get("/templates", response_model=List[MessageTemplateOut])
def get_message_templates(
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retrieve all configurable WhatsApp message templates."""
    templates = db.query(MessageTemplate).order_by(MessageTemplate.id.asc()).all()
    if not templates:
        # Seed defaults if not present
        for t in DEFAULT_TEMPLATES:
            new_t = MessageTemplate(
                template_key=t["template_key"],
                title=t["title"],
                content=t["content"],
                variables_hint=t["variables_hint"],
                updated_at=datetime.utcnow()
            )
            db.add(new_t)
        db.commit()
        templates = db.query(MessageTemplate).order_by(MessageTemplate.id.asc()).all()
    return templates

@router.put("/templates/{template_key}", response_model=MessageTemplateOut)
def update_message_template(
    template_key: str,
    payload: MessageTemplateUpdate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update custom content for a specific message template."""
    tmpl = db.query(MessageTemplate).filter(MessageTemplate.template_key == template_key).first()
    if not tmpl:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Template '{template_key}' not found")
    tmpl.content = payload.content.strip()
    tmpl.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(tmpl)
    return tmpl

@router.post("/templates/reset", response_model=List[MessageTemplateOut])
def reset_message_templates(
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Reset all message templates to system defaults."""
    for default_item in DEFAULT_TEMPLATES:
        tmpl = db.query(MessageTemplate).filter(MessageTemplate.template_key == default_item["template_key"]).first()
        if tmpl:
            tmpl.title = default_item["title"]
            tmpl.content = default_item["content"]
            tmpl.variables_hint = default_item["variables_hint"]
            tmpl.updated_at = datetime.utcnow()
        else:
            db.add(MessageTemplate(
                template_key=default_item["template_key"],
                title=default_item["title"],
                content=default_item["content"],
                variables_hint=default_item["variables_hint"],
                updated_at=datetime.utcnow()
            ))
    db.commit()
    return db.query(MessageTemplate).order_by(MessageTemplate.id.asc()).all()
