import random
import string
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.models import Customer, Booking, SliderImage, MarketingConsent, WhatsAppMessage
from app.schemas import BookingCreate, BookingOut, SliderImageOut
from app.services.whatsapp_service import whatsapp_service

router = APIRouter(tags=["Public"])

def generate_booking_reference(db: Session) -> str:
    """Generate a unique human-friendly booking reference like PB08-26-8942."""
    for _ in range(10):
        random_suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
        year_suffix = datetime.utcnow().strftime("%y")
        candidate = f"PB08-{year_suffix}-{random_suffix}"
        if not db.query(Booking).filter(Booking.booking_reference == candidate).first():
            return candidate
    # Fallback with timestamp
    return f"PB08-{int(datetime.utcnow().timestamp())}"

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint for Render and uptime monitoring."""
    try:
        # Simple database ping
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "error"
    return {
        "status": "ok",
        "service": "PB08 TAXI API",
        "database": db_status,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/slider-images", response_model=List[SliderImageOut])
def get_public_slider_images(db: Session = Depends(get_db)):
    """Fetch active slider images for the public homepage."""
    slides = (
        db.query(SliderImage)
        .filter(SliderImage.is_active == True)
        .order_by(SliderImage.sort_order.asc(), SliderImage.id.asc())
        .all()
    )
    return slides

@router.post("/bookings", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
async def create_booking(booking_in: BookingCreate, db: Session = Depends(get_db)):
    """
    One Click Book Your Ride endpoint:
    1. Validate inputs.
    2. Save or update customer in Neon PostgreSQL (prevent duplicates).
    3. Create booking with unique reference.
    4. Send confirmation WhatsApp message via OpenWA.
    5. Always persist booking even if WhatsApp delivery fails.
    """
    clean_phone = booking_in.whatsapp_number.strip()
    customer_name = booking_in.customer_name.strip()

    # 1. Customer deduplication: Check if customer already exists by phone
    customer = db.query(Customer).filter(Customer.whatsapp_number == clean_phone).first()
    if customer:
        customer.name = customer_name
        customer.marketing_consent = booking_in.marketing_consent
        customer.updated_at = datetime.utcnow()
    else:
        customer = Customer(
            name=customer_name,
            whatsapp_number=clean_phone,
            marketing_consent=booking_in.marketing_consent,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(customer)
    
    db.commit()
    db.refresh(customer)

    # 2. Record marketing consent entry
    consent_record = MarketingConsent(
        customer_id=customer.id,
        phone=clean_phone,
        consent_given=booking_in.marketing_consent,
        source="booking_form"
    )
    db.add(consent_record)

    # 3. Create booking record
    ref_code = generate_booking_reference(db)
    booking = Booking(
        booking_reference=ref_code,
        customer_id=customer.id,
        pickup_location=booking_in.pickup_location.strip() if booking_in.pickup_location else None,
        destination=booking_in.destination.strip() if booking_in.destination else None,
        status="PENDING",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # 4. WhatsApp Confirmation Message
    # Exact specified text:
    # "Hi {Customer Name}, our support team will contact you shortly. You will receive a call from us soon. Thank you for connecting with PB08 TAXI!"
    confirmation_text = (
        f"Hi {customer.name}, our support team will contact you shortly. "
        f"You will receive a call from us soon. "
        f"Thank you for connecting with PB08 TAXI! "
        f"(Booking Ref: {booking.booking_reference})"
    )

    wa_success, wa_error = await whatsapp_service.send_text_message(
        db=db,
        phone=clean_phone,
        message=confirmation_text,
        message_type="BOOKING_CONFIRMATION",
        customer_id=customer.id
    )

    # 5. Return booking details with customer info
    return BookingOut(
        id=booking.id,
        booking_reference=booking.booking_reference,
        customer_id=customer.id,
        customer_name=customer.name,
        whatsapp_number=customer.whatsapp_number,
        pickup_location=booking.pickup_location,
        destination=booking.destination,
        status=booking.status,
        notes=booking.notes,
        created_at=booking.created_at,
        whatsapp_status="SENT" if wa_success else "FAILED"
    )
