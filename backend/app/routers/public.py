import re
import random
import string
import time
import urllib.parse
from datetime import datetime, timedelta
from typing import List, Optional, Tuple
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.models import Customer, Booking, SliderImage, MarketingConsent, WhatsAppMessage, SystemSetting, MessageTemplate, FleetCar
from app.schemas import BookingCreate, BookingOut, SliderImageOut, FleetCarOut, normalize_phone_with_plus
from app.services.whatsapp_service import whatsapp_service, send_background_message, send_background_location_message

router = APIRouter(tags=["Public"])

def format_friendly_date(date_str: Optional[str]) -> str:
    """Format YYYY-MM-DD to standard DD-MM-YYYY (e.g. '13-10-2026')."""
    if not date_str:
        return "Immediate / Today"
    try:
        dt = datetime.strptime(date_str.strip(), "%Y-%m-%d")
        return dt.strftime("%d-%m-%Y")
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

def extract_gps_coordinates(text: Optional[str]) -> Optional[Tuple[float, float]]:
    """Extract latitude and longitude from location text like 'GPS Location (28.6139, 77.2090)'."""
    if not text:
        return None
    match = re.search(r"(-?\d+\.\d{3,}),\s*(-?\d+\.\d{3,})", text)
    if match:
        try:
            return float(match.group(1).strip()), float(match.group(2).strip())
        except ValueError:
            return None
    return None

def get_google_maps_url(lat: Optional[float], lng: Optional[float], location_text: Optional[str] = None) -> Optional[str]:
    """
    Generate official Google Maps Directions URL (https://www.google.com/maps/dir/?api=1&destination=...&travelmode=driving).
    When opened on mobile (WhatsApp) or desktop, Google Maps immediately locks destination to the passenger pickup point
    and computes turn-by-turn driving directions from the user/chauffeur's current location.
    Supports exact numeric coordinates or clean URL-encoded location names.
    """
    if lat is not None and lng is not None and (abs(lat) > 0.0001 or abs(lng) > 0.0001):
        return f"https://www.google.com/maps/dir/?api=1&destination={lat:.6f},{lng:.6f}&travelmode=driving"
    coords = extract_gps_coordinates(location_text)
    if coords and (abs(coords[0]) > 0.0001 or abs(coords[1]) > 0.0001):
        return f"https://www.google.com/maps/dir/?api=1&destination={coords[0]:.6f},{coords[1]:.6f}&travelmode=driving"
    if location_text and location_text.strip():
        clean_text = location_text.strip()
        clean_text = re.sub(r"GPS\s*Location\s*\([^\)]*\)", "", clean_text, flags=re.IGNORECASE).strip(" ,-")
        if clean_text:
            encoded_dest = urllib.parse.quote_plus(clean_text)
            return f"https://www.google.com/maps/dir/?api=1&destination={encoded_dest}&travelmode=driving"
    return None

def clean_location_address(address: Optional[str], lat: Optional[float] = None, lng: Optional[float] = None) -> str:
    """
    Clean address string so WhatsApp and Google Maps never query invalid 'GPS Location (...)' text.
    If only coordinates or 'GPS Location (...)' was provided, returns clean '{lat:.6f}, {lng:.6f}'.
    Otherwise returns the clean human-readable place name (e.g. 'Model Town, Jalandhar').
    """
    clean_addr = (address or "").strip()
    if not clean_addr or "gps location" in clean_addr.lower():
        stripped = re.sub(r"GPS\s*Location\s*\([^\)]*\)", "", clean_addr, flags=re.IGNORECASE).strip(" ,-")
        if stripped:
            return stripped
        if lat is not None and lng is not None:
            return f"{lat:.6f}, {lng:.6f}"
        return "Passenger Pickup Location"
    clean_addr = re.sub(r"GPS\s*Location\s*\([^\)]*\)", "", clean_addr, flags=re.IGNORECASE).strip(" ,-")
    if not clean_addr and lat is not None and lng is not None:
        return f"{lat:.6f}, {lng:.6f}"
    return clean_addr or "Passenger Pickup Location"

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

@router.get("/fleet-cars", response_model=List[FleetCarOut])
def get_public_fleet_cars(db: Session = Depends(get_db)):
    """Fetch active fleet cars for booking car selection and website visitors."""
    cars = (
        db.query(FleetCar)
        .filter(FleetCar.is_active == True)
        .order_by(FleetCar.id.asc())
        .all()
    )
    return [
        FleetCarOut(
            id=c.id,
            name=c.name,
            category=c.category or "Sedan",
            seating_capacity=c.seating_capacity or "4+1 Seater",
            is_active=c.is_active,
            created_at=c.created_at,
            updated_at=c.updated_at,
            drivers_count=0
        )
        for c in cars
    ]

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
    One Click Book Your Ride endpoint (Zero-Failure Architecture):
    1. Validate and normalize inputs.
    2. Save or update customer in Neon PostgreSQL (deduplicated by phone).
    3. Persist booking with trip_type ('One Way Trip' / 'Round Trip') and auto-retry on connection drops.
    4. Queue confirmation WhatsApp message in background with clear trip type.
    5. Queue admin alert WhatsApp notification with trip type.
    """
    clean_phone = booking_in.whatsapp_number.strip()
    customer_name = booking_in.customer_name.strip()
    
    # Validate trip type is explicitly selected
    raw_trip = (booking_in.trip_type or "").strip()
    if not raw_trip:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please select your trip type (One Way Trip or Round Trip)."
        )
    if "round" in raw_trip.lower():
        trip_type_val = "Round Trip"
    else:
        trip_type_val = "One Way Trip"

    car_name_val = booking_in.car_name.strip() if (booking_in.car_name and booking_in.car_name.strip()) else None
    pickup_date_clean = booking_in.pickup_date.strip() if booking_in.pickup_date else None
    pickup_time_clean = booking_in.pickup_time.strip() if booking_in.pickup_time else None

    # Resolve GPS coordinates if provided or if embedded in pickup_location text
    lat_val = booking_in.pickup_lat
    lng_val = booking_in.pickup_lng
    if lat_val is None or lng_val is None:
        coords = extract_gps_coordinates(booking_in.pickup_location)
        if coords:
            lat_val, lng_val = coords

    customer = None
    booking = None

    # Bulletproof Database Commit Loop (handles serverless connection reconnects & on-the-fly column migrations)
    for attempt in range(3):
        try:
            # 1. Customer deduplication
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
                car_name=car_name_val,
                trip_type=trip_type_val,
                pickup_location=booking_in.pickup_location.strip() if booking_in.pickup_location else None,
                destination=booking_in.destination.strip() if booking_in.destination else None,
                pickup_date=pickup_date_clean,
                pickup_time=pickup_time_clean,
                pickup_lat=lat_val,
                pickup_lng=lng_val,
                status="PENDING",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(booking)
            db.commit()
            db.refresh(booking)
            break
        except Exception as exc:
            db.rollback()
            err_str = str(exc).lower()
            # If trip_type column is missing on existing database, apply migration on the fly
            if "trip_type" in err_str or "undefinedcolumn" in err_str:
                try:
                    db.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS trip_type VARCHAR(50) DEFAULT 'One Way Trip';"))
                    db.commit()
                except Exception:
                    try:
                        db.execute(text("ALTER TABLE bookings ADD COLUMN trip_type VARCHAR(50) DEFAULT 'One Way Trip';"))
                        db.commit()
                    except Exception:
                        pass
            if attempt == 2:
                # Emergency fallback if all retries hit DB issue: create booking without trip_type to guarantee zero booking loss
                try:
                    booking = Booking(
                        booking_reference=ref_code,
                        customer_id=customer.id,
                        car_name=car_name_val,
                        pickup_location=booking_in.pickup_location.strip() if booking_in.pickup_location else None,
                        destination=booking_in.destination.strip() if booking_in.destination else None,
                        pickup_date=pickup_date_clean,
                        pickup_time=pickup_time_clean,
                        pickup_lat=lat_val,
                        pickup_lng=lng_val,
                        status="PENDING",
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )
                    db.add(booking)
                    db.commit()
                    db.refresh(booking)
                    break
                except Exception as final_err:
                    db.rollback()
                    raise HTTPException(status_code=500, detail="Booking service busy. Please retry.")
            time.sleep(0.3)

    # 4. Format WhatsApp Confirmation Message (Customer)
    friendly_date = format_friendly_date(booking.pickup_date) if booking.pickup_date else "Immediate / Today"
    friendly_time = format_friendly_time(booking.pickup_time) if booking.pickup_date else "As soon as possible"
    
    maps_url = get_google_maps_url(booking.pickup_lat, booking.pickup_lng, booking.pickup_location)
    gps_line = f"🗺️ *GPS Navigation:* {maps_url}" if maps_url else ""

    support_setting = db.query(SystemSetting).filter(SystemSetting.key == "support_phone").first()
    support_phone_val = support_setting.value if support_setting and support_setting.value else "+919876543210"

    tpl = db.query(MessageTemplate).filter(MessageTemplate.template_key == "booking_received").first()
    if tpl and tpl.content:
        ctx = {
            "customer_name": customer.name,
            "customer_contact": customer.whatsapp_number,
            "booking_ref": booking.booking_reference,
            "trip_type": trip_type_val,
            "car_name": car_name_val or "Dedicated Cab",
            "pickup_date": friendly_date,
            "pickup_time": friendly_time,
            "pickup_location": booking.pickup_location or "Not specified",
            "gps_location": gps_line,
            "google_maps_link": maps_url or "",
            "destination": booking.destination or "Not specified",
            "support_phone": support_phone_val,
            "notes": booking.notes or ""
        }
        confirmation_text = tpl.content
        for k, v in ctx.items():
            confirmation_text = confirmation_text.replace(f"{{{k}}}", str(v) if v is not None else "")

        # If template didn't explicitly include trip_type, seamlessly inject it under Preferred Car or Booking Ref
        if "Trip Type" not in confirmation_text:
            if "Preferred Car:" in confirmation_text:
                confirmation_text = confirmation_text.replace(
                    "Preferred Car:",
                    f"Trip Type:* {trip_type_val}\n🚘 *Preferred Car:"
                )
            elif f"#{booking.booking_reference}" in confirmation_text:
                confirmation_text = confirmation_text.replace(
                    f"#{booking.booking_reference}",
                    f"#{booking.booking_reference} ({trip_type_val})"
                )

        # If template didn't include {gps_location} or {google_maps_link}, seamlessly append GPS map link under pickup location
        if gps_line and maps_url and maps_url not in confirmation_text:
            if booking.pickup_location and f"📍 *Pickup Location:* {booking.pickup_location}" in confirmation_text:
                confirmation_text = confirmation_text.replace(
                    f"📍 *Pickup Location:* {booking.pickup_location}",
                    f"📍 *Pickup Location:* {booking.pickup_location}\n{gps_line}"
                )
            else:
                confirmation_text += f"\n{gps_line}"
    else:
        schedule_text = f" for {friendly_date} at {friendly_time}" if (friendly_date and friendly_time) else ""
        vehicle_text = f" [Car: {car_name_val}]" if car_name_val else ""
        maps_clause = f"\n{gps_line}" if gps_line else ""
        confirmation_text = (
            f"Hi {customer.name}, thank you for choosing PB08 TAXI! "
            f"Your {trip_type_val} booking request has been received (Ref: #{booking.booking_reference}{vehicle_text}{schedule_text}). "
            f"Our support team will contact you shortly to confirm your ride."
            f"{maps_clause}"
        )

    # Dispatch to customer asynchronously in background task (Instant API response, never blocks or fails user booking!)
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
        if admin_target_phone and not admin_target_phone.startswith("+"):
            admin_target_phone = f"+{re.sub(r'\\D', '', admin_target_phone)}"

        if is_admin_alert_enabled and admin_target_phone:
            ist_time = booking.created_at + timedelta(hours=5, minutes=30)
            booked_at_ist = ist_time.strftime("%d-%b-%Y, %I:%M %p")

            date_disp = format_friendly_date(booking.pickup_date)
            time_disp = format_friendly_time(booking.pickup_time)
            car_disp = car_name_val if car_name_val else "Any Available Cab"
            admin_maps_clause = f"🗺️ *GPS Live Navigation:* {maps_url}" if maps_url else ""

            admin_tpl = db.query(MessageTemplate).filter(MessageTemplate.template_key == "admin_booking_alert").first()
            if admin_tpl and admin_tpl.content:
                admin_ctx = {
                    "booking_ref": booking.booking_reference,
                    "trip_type": trip_type_val,
                    "customer_name": customer.name,
                    "customer_contact": customer.whatsapp_number,
                    "car_name": car_disp,
                    "pickup_date": date_disp,
                    "pickup_time": time_disp,
                    "pickup_location": booking.pickup_location or "Not specified",
                    "gps_location": admin_maps_clause,
                    "google_maps_link": maps_url or "",
                    "destination": booking.destination or "Not specified",
                    "booked_at": booked_at_ist,
                    "notes": booking.notes or ""
                }
                admin_alert_text = admin_tpl.content
                for k, v in admin_ctx.items():
                    admin_alert_text = admin_alert_text.replace(f"{{{k}}}", str(v) if v is not None else "")

                # If template didn't explicitly include trip_type, seamlessly inject it
                if "Trip Type" not in admin_alert_text:
                    if f"#{booking.booking_reference}" in admin_alert_text:
                        admin_alert_text = admin_alert_text.replace(
                            f"#{booking.booking_reference}",
                            f"#{booking.booking_reference}\n🛣️ *Trip Type:* {trip_type_val}"
                        )
            else:
                admin_maps_clause_formatted = f"\n{admin_maps_clause}" if admin_maps_clause else ""
                admin_alert_text = (
                    f"🚖 *PB08 TAXI — New Booking Alert!*\n"
                    f"━━━━━━━━━━━━━━━━━━━━\n"
                    f"📌 *Booking Ref:* #{booking.booking_reference}\n"
                    f"🛣️ *Trip Type:* {trip_type_val}\n"
                    f"👤 *Customer Name:* {customer.name}\n"
                    f"📞 *Contact Number:* {customer.whatsapp_number}\n"
                    f"🚘 *Selected Car:* {car_disp}\n"
                    f"📅 *Pickup Date:* {date_disp}\n"
                    f"⏰ *Pickup Time:* {time_disp}\n"
                    f"📍 *Pickup Location:* {booking.pickup_location or 'Not specified'}"
                    f"{admin_maps_clause_formatted}\n"
                    f"🏁 *Destination:* {booking.destination or 'Not specified'}\n"
                    f"🕒 *Booked At (IST):* {booked_at_ist}\n"
                    f"━━━━━━━━━━━━━━━━━━━━\n"
                    f"👉 _Please contact customer promptly to confirm the ride._"
                )

            # Dispatch text message alert to admin
            background_tasks.add_task(
                send_background_message,
                phone=admin_target_phone,
                message=admin_alert_text,
                message_type="ADMIN_BOOKING_ALERT",
                customer_id=customer.id
            )

            # If GPS coordinates exist, ALSO dispatch native WhatsApp location pin card to admin!
            if lat_val is not None and lng_val is not None:
                clean_admin_addr = clean_location_address(booking.pickup_location, lat_val, lng_val)
                background_tasks.add_task(
                    send_background_location_message,
                    phone=admin_target_phone,
                    latitude=lat_val,
                    longitude=lng_val,
                    address=clean_admin_addr,
                    description=f"Booking #{booking.booking_reference}: {customer.name} ({trip_type_val})",
                    customer_id=customer.id
                )
            elif maps_url and booking.pickup_location:
                # If no numeric GPS, dispatch navigation card text message so admin always gets working map directions
                nav_msg = (
                    f"🗺️ *PB08 TAXI — Passenger Pickup Navigation*\n"
                    f"━━━━━━━━━━━━━━━━━━━━\n"
                    f"📌 *Booking Ref:* #{booking.booking_reference}\n"
                    f"👤 *Passenger:* {customer.name} ({customer.whatsapp_number})\n"
                    f"🛣️ *Trip Type:* {trip_type_val}\n"
                    f"🚘 *Selected Car:* {car_disp}\n"
                    f"📍 *Pickup Location:* {booking.pickup_location}\n"
                    f"🏁 *Destination:* {booking.destination or 'Not specified'}\n\n"
                    f"🚗 *Tap to Start Google Maps Driving Directions:*\n"
                    f"{maps_url}\n\n"
                    f"👉 _Click the link above to immediately start turn-by-turn navigation directly to the passenger!_\n"
                    f"━━━━━━━━━━━━━━━━━━━━"
                )
                background_tasks.add_task(
                    send_background_message,
                    phone=admin_target_phone,
                    message=nav_msg,
                    message_type="NAVIGATION_LINK",
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
        car_name=booking.car_name,
        trip_type=getattr(booking, 'trip_type', None) or trip_type_val,
        pickup_location=booking.pickup_location,
        destination=booking.destination,
        pickup_date=booking.pickup_date,
        pickup_time=booking.pickup_time,
        pickup_lat=booking.pickup_lat,
        pickup_lng=booking.pickup_lng,
        google_maps_url=maps_url,
        status=booking.status,
        notes=booking.notes,
        created_at=booking.created_at,
        whatsapp_status="PENDING"
    )
