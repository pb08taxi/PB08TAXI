import random
import string
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.models import Customer, Booking, SliderImage, MarketingConsent, WhatsAppMessage, SystemSetting, MessageTemplate
from app.schemas import BookingCreate, BookingOut, SliderImageOut
from app.services.whatsapp_service import whatsapp_service, send_background_message

router = APIRouter(tags=["Public"])

def format_friendly_date(date_str: Optional[str]) -> str:
    """Format YYYY-MM-DD to friendly '12-Oct-2026'."""
    if not date_str:
        return "Immediate / Today"
    try:
        dt = datetime.strptime(date_str.strip(), "%Y-%m-%d")
        return dt.strftime("%d-%b-%Y")
    except Exception:
        return date_str.strip()

def format_friendly_time(time_str: Optional[str]) -> str:
    """Format HH:MM (24-hour) to '10:30 AM' or '06:45 PM'."""
    if not time_str:
        return "As soon as possible"
    try:
        t = datetime.strptime(time_str.strip(), "%H:%M")
        return t.strftime("%I:%M %p")
    except Exception:
        return time_str.strip()

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
async def create_booking(
    booking_in: BookingCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    One Click Book Your Ride endpoint:
    1. Validate inputs.
    2. Save or update customer in Neon PostgreSQL (prevent duplicates).
    3. Create booking with unique reference.
    4. Queue confirmation WhatsApp message in background (instant response!).
    5. Queue admin alert WhatsApp notification in background.
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
    pickup_date_clean = booking_in.pickup_date.strip() if booking_in.pickup_date else None
    pickup_time_clean = booking_in.pickup_time.strip() if booking_in.pickup_time else None

    booking = Booking(
        booking_reference=ref_code,
        customer_id=customer.id,
        pickup_location=booking_in.pickup_location.strip() if booking_in.pickup_location else None,
        destination=booking_in.destination.strip() if booking_in.destination else None,
        pickup_date=pickup_date_clean,
        pickup_time=pickup_time_clean,
        status="PENDING",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # 4. Format WhatsApp Confirmation Message (Uses customizable template if configured)
    friendly_date = format_friendly_date(booking.pickup_date) if booking.pickup_date else "Immediate / Today"
    friendly_time = format_friendly_time(booking.pickup_time) if booking.pickup_date else "As soon as possible"
    
    support_setting = db.query(SystemSetting).filter(SystemSetting.key == "support_phone").first()
    support_phone_val = support_setting.value if support_setting and support_setting.value else "+91 98765 43210"

    tpl = db.query(MessageTemplate).filter(MessageTemplate.template_key == "booking_received").first()
    if tpl and tpl.content:
        ctx = {
            "customer_name": customer.name,
            "customer_contact": customer.whatsapp_number,
            "booking_ref": booking.booking_reference,
            "pickup_date": friendly_date,
            "pickup_time": friendly_time,
            "pickup_location": booking.pickup_location or "Not specified",
            "destination": booking.destination or "Not specified",
            "support_phone": support_phone_val,
            "notes": booking.notes or ""
        }
        confirmation_text = tpl.content
        for k, v in ctx.items():
            confirmation_text = confirmation_text.replace(f"{{{k}}}", str(v) if v is not None else "")
    else:
        schedule_text = f" for {friendly_date} at {friendly_time}" if (friendly_date and friendly_time) else ""
        confirmation_text = (
            f"Hi {customer.name}, our support team will contact you shortly. "
            f"You will receive a call from us soon. "
            f"Thank you for connecting with PB08 TAXI! "
            f"(Booking Ref: #{booking.booking_reference}{schedule_text})"
        )

    # Dispatch to customer asynchronously in background task (Instant API response!)
    background_tasks.add_task(
        send_background_message,
        phone=clean_phone,
        message=confirmation_text,
        message_type="BOOKING_CONFIRMATION",
        customer_id=customer.id
    )

    # 5. Format & Queue Automated WhatsApp Notification Alert for Admin
    try:
        admin_phone_setting = db.query(SystemSetting).filter(SystemSetting.key == "admin_alert_whatsapp_number").first()
        admin_enabled_setting = db.query(SystemSetting).filter(SystemSetting.key == "admin_alert_whatsapp_enabled").first()

        is_admin_alert_enabled = True
        if admin_enabled_setting and admin_enabled_setting.value is not None:
            is_admin_alert_enabled = admin_enabled_setting.value.lower() in ("true", "1", "yes")

        admin_target_phone = admin_phone_setting.value.strip() if admin_phone_setting and admin_phone_setting.value else None

        if is_admin_alert_enabled and admin_target_phone:
            ist_time = booking.created_at + timedelta(hours=5, minutes=30)
            booked_at_ist = ist_time.strftime("%d-%b-%Y, %I:%M %p")

            date_disp = format_friendly_date(booking.pickup_date)
            time_disp = format_friendly_time(booking.pickup_time)

            admin_alert_text = (
                f"🚖 *PB08 TAXI — New Booking Alert!*\n"
                f"━━━━━━━━━━━━━━━━━━━━\n"
                f"📌 *Booking Ref:* #{booking.booking_reference}\n"
                f"👤 *Customer Name:* {customer.name}\n"
                f"📞 *Contact Number:* {customer.whatsapp_number}\n"
                f"📅 *Pickup Date:* {date_disp}\n"
                f"⏰ *Pickup Time:* {time_disp}\n"
                f"📍 *Pickup Location:* {booking.pickup_location or 'Not specified'}\n"
                f"🏁 *Destination:* {booking.destination or 'Not specified'}\n"
                f"🕒 *Booked At (IST):* {booked_at_ist}\n"
                f"━━━━━━━━━━━━━━━━━━━━\n"
                f"👉 _Please contact customer promptly to confirm the ride._"
            )

            # Dispatch to admin asynchronously in background task (Zero blocking latency!)
            background_tasks.add_task(
                send_background_message,
                phone=admin_target_phone,
                message=admin_alert_text,
                message_type="ADMIN_BOOKING_ALERT",
                customer_id=customer.id
            )
    except Exception:
        pass

    # 6. Return booking details with customer info
    return BookingOut(
        id=booking.id,
        booking_reference=booking.booking_reference,
        customer_id=customer.id,
        customer_name=customer.name,
        whatsapp_number=customer.whatsapp_number,
        pickup_location=booking.pickup_location,
        destination=booking.destination,
        pickup_date=booking.pickup_date,
        pickup_time=booking.pickup_time,
        status=booking.status,
        notes=booking.notes,
        created_at=booking.created_at,
        whatsapp_status="SENT" if wa_success else "FAILED"
    )
