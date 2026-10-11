import asyncio
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AdminUser, Customer, WhatsAppMessage
from app.schemas import (
    WhatsAppStatusOut,
    WhatsAppTestMessage,
    WhatsAppOfferRequest,
    WhatsAppMessageOut
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
    """Disconnect and stop the OpenWA WhatsApp session."""
    result = await whatsapp_service.disconnect_session(db)
    return result

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
