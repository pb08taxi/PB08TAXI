from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import AdminUser, Booking, Customer, WhatsAppMessage, Driver, MessageTemplate, SystemSetting
from app.schemas import BookingOut, BookingStatusUpdate
from app.services.whatsapp_service import whatsapp_service, send_background_message, send_background_location_message
from app.routers.public import get_google_maps_url
from app.security import get_current_admin

router = APIRouter(prefix="/admin/bookings", tags=["Admin Bookings"])

def format_friendly_date(date_str: Optional[str]) -> str:
    if not date_str:
        return ""
    try:
        dt = datetime.strptime(date_str.strip(), "%Y-%m-%d")
        return dt.strftime("%d-%m-%Y")
    except Exception:
        return date_str.strip()

def format_friendly_time(time_str: Optional[str]) -> str:
    if not time_str:
        return ""
    try:
        dt = datetime.strptime(time_str, "%H:%M")
        return dt.strftime("%I:%M %p")
    except Exception:
        return time_str

def render_template(template_text: str, context: dict) -> str:
    res = template_text
    for k, v in context.items():
        res = res.replace(f"{{{k}}}", str(v) if v is not None else "")
    return res

@router.get("", response_model=List[BookingOut])
def list_bookings(
    status_filter: Optional[str] = Query(None, description="Filter by status (PENDING, CONFIRMED, COMPLETED, CANCELLED)"),
    q: Optional[str] = Query(None, description="Search by ref, customer name, or phone"),
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List bookings with customer details, assigned driver, and status filtering."""
    query = db.query(Booking).join(Customer, Customer.id == Booking.customer_id).outerjoin(Driver, Driver.id == Booking.driver_id)

    if status_filter and status_filter.upper() != "ALL":
        query = query.filter(Booking.status == status_filter.upper())

    if q and q.strip():
        search_term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Booking.booking_reference.ilike(search_term),
                Customer.name.ilike(search_term),
                Customer.whatsapp_number.ilike(search_term),
                Booking.pickup_location.ilike(search_term),
                Booking.destination.ilike(search_term),
                Driver.name.ilike(search_term),
                Driver.taxi_registration.ilike(search_term)
            )
        )

    bookings = query.order_by(Booking.created_at.desc()).all()

    out = []
    for b in bookings:
        latest_msg = (
            db.query(WhatsAppMessage)
            .filter(WhatsAppMessage.customer_id == b.customer_id)
            .order_by(WhatsAppMessage.sent_at.desc())
            .first()
        )
        wa_status = latest_msg.status if latest_msg else "NONE"

        out.append(
            BookingOut(
                id=b.id,
                booking_reference=b.booking_reference,
                customer_id=b.customer_id,
                customer_name=b.customer.name,
                whatsapp_number=b.customer.whatsapp_number,
                driver_id=b.driver_id,
                driver_name=b.driver.name if b.driver else None,
                driver_taxi_registration=b.driver.taxi_registration if b.driver else None,
                driver_contact=b.driver.contact_number if b.driver else None,
                car_name=b.car_name or (b.driver.car_name if b.driver else None),
                pickup_location=b.pickup_location,
                destination=b.destination,
                pickup_date=b.pickup_date,
                pickup_time=b.pickup_time,
                pickup_lat=b.pickup_lat,
                pickup_lng=b.pickup_lng,
                google_maps_url=get_google_maps_url(b.pickup_lat, b.pickup_lng, b.pickup_location),
                status=b.status,
                notes=b.notes,
                created_at=b.created_at,
                whatsapp_status=wa_status
            )
        )
    return out

@router.patch("/{booking_id}/status", response_model=BookingOut)
async def update_booking_status(
    booking_id: int,
    payload: BookingStatusUpdate,
    background_tasks: BackgroundTasks,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update status, assign driver, and dispatch template WhatsApp alerts asynchronously in background."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    old_status = booking.status
    booking.status = payload.status
    if payload.notes is not None:
        booking.notes = payload.notes
    if payload.driver_id is not None:
        booking.driver_id = payload.driver_id if payload.driver_id > 0 else None
    booking.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(booking)

    # Fetch support phone for templates
    support_setting = db.query(SystemSetting).filter(SystemSetting.key == "support_phone").first()
    support_phone = support_setting.value if support_setting and support_setting.value else "+919876543210"

    driver = db.query(Driver).filter(Driver.id == booking.driver_id).first() if booking.driver_id else None

    # Handle automated WhatsApp dispatches in background (Instant UI response!)
    if payload.send_whatsapp:
        date_disp = format_friendly_date(booking.pickup_date) or "As scheduled"
        time_disp = format_friendly_time(booking.pickup_time) or "Immediate"
        maps_url = get_google_maps_url(booking.pickup_lat, booking.pickup_lng, booking.pickup_location)
        gps_line = f"🗺️ *GPS Navigation:* {maps_url}" if maps_url else ""

        base_ctx = {
            "customer_name": booking.customer.name,
            "customer_contact": booking.customer.whatsapp_number,
            "booking_ref": booking.booking_reference,
            "pickup_date": date_disp,
            "pickup_time": time_disp,
            "pickup_location": booking.pickup_location or "Not specified",
            "gps_location": gps_line,
            "google_maps_link": maps_url or "",
            "destination": booking.destination or "Not specified",
            "support_phone": support_phone,
            "notes": booking.notes or "None"
        }

        # 1. Status CONFIRMED
        if payload.status == "CONFIRMED":
            # Context with driver details
            car_name_val = (driver.car_name if driver and driver.car_name else None) or booking.car_name or "PB08 Dedicated Cab"
            cust_ctx = dict(base_ctx)
            cust_ctx["driver_name"] = driver.name if driver else "Assigned PB08 Driver"
            cust_ctx["taxi_number"] = driver.taxi_registration if driver else "PB08 TAXI"
            cust_ctx["driver_contact"] = driver.contact_number if driver else support_phone
            cust_ctx["car_name"] = car_name_val

            tmpl = db.query(MessageTemplate).filter(MessageTemplate.template_key == "booking_confirmed").first()
            if tmpl:
                cust_msg = render_template(tmpl.content, cust_ctx)
                if gps_line and maps_url and maps_url not in cust_msg:
                    if booking.pickup_location and f"📍 *Pickup Location:* {booking.pickup_location}" in cust_msg:
                        cust_msg = cust_msg.replace(
                            f"📍 *Pickup Location:* {booking.pickup_location}",
                            f"📍 *Pickup Location:* {booking.pickup_location}\n{gps_line}"
                        )
            else:
                cust_maps_clause = f"\n• *GPS Navigation:* {maps_url}" if maps_url else ""
                cust_msg = (
                    f"🚖 *PB08 TAXI — Ride Confirmed!*\n"
                    f"Hello {booking.customer.name}, your ride has been confirmed (Ref: #{booking.booking_reference})!\n"
                    f"📅 *Pickup Date:* {date_disp} at {time_disp}\n"
                    f"📍 *Pickup:* {booking.pickup_location}{cust_maps_clause}\n"
                    f"🏁 *Destination:* {booking.destination}\n\n"
                    f"🚗 *Driver & Cab Details:*\n"
                    f"👤 *Driver Name:* {cust_ctx['driver_name']}\n"
                    f"🚘 *Car:* {cust_ctx['car_name']}\n"
                    f"🚖 *Taxi No:* {cust_ctx['taxi_number']}\n"
                    f"📞 *Contact:* {cust_ctx['driver_contact']}\n\n"
                    f"Have a pleasant trip!"
                )
            
            # Send to customer in background
            background_tasks.add_task(
                send_background_message,
                phone=booking.customer.whatsapp_number,
                message=cust_msg,
                message_type="BOOKING_CONFIRMATION",
                customer_id=booking.customer_id
            )

            # Send duty alert to driver in background if driver is assigned
            if driver and driver.contact_number:
                driver_tmpl = db.query(MessageTemplate).filter(MessageTemplate.template_key == "driver_assignment").first()
                driver_ctx = {
                    "driver_name": driver.name,
                    "car_name": car_name_val,
                    "taxi_number": driver.taxi_registration,
                    "booking_ref": booking.booking_reference,
                    "customer_name": booking.customer.name,
                    "customer_contact": booking.customer.whatsapp_number,
                    "pickup_date": date_disp,
                    "pickup_time": time_disp,
                    "pickup_location": booking.pickup_location or "Not specified",
                    "gps_location": gps_line,
                    "google_maps_link": maps_url or "",
                    "destination": booking.destination or "Not specified",
                }
                if driver_tmpl:
                    driver_msg = render_template(driver_tmpl.content, driver_ctx)
                    if gps_line and maps_url and maps_url not in driver_msg:
                        if booking.pickup_location and f"📍 *Pickup Location:* {booking.pickup_location}" in driver_msg:
                            driver_msg = driver_msg.replace(
                                f"📍 *Pickup Location:* {booking.pickup_location}",
                                f"📍 *Pickup Location:* {booking.pickup_location}\n{gps_line}"
                            )
                else:
                    driver_maps_clause = f"\n• *GPS Navigation:* {maps_url}" if maps_url else ""
                    driver_msg = (
                        f"🚖 *PB08 TAXI — New Duty Assigned!*\n"
                        f"Hello {driver.name}, a new ride has been assigned to your cab ({car_name_val} - {driver.taxi_registration}):\n"
                        f"📌 *Booking Ref:* #{booking.booking_reference}\n"
                        f"👤 *Customer Name:* {booking.customer.name}\n"
                        f"📞 *Contact:* {booking.customer.whatsapp_number}\n"
                        f"📅 *Scheduled:* {date_disp} at {time_disp}\n"
                        f"📍 *Pickup:* {booking.pickup_location}{driver_maps_clause}\n"
                        f"🏁 *Destination:* {booking.destination}\n\n"
                        f"👉 Please coordinate with the customer."
                    )
                background_tasks.add_task(
                    send_background_message,
                    phone=driver.contact_number,
                    message=driver_msg,
                    message_type="DRIVER_DUTY_ALERT"
                )

                # Also dispatch native WhatsApp location pin card to driver if GPS coordinates exist!
                if booking.pickup_lat and booking.pickup_lng:
                    background_tasks.add_task(
                        send_background_location_message,
                        phone=driver.contact_number,
                        latitude=booking.pickup_lat,
                        longitude=booking.pickup_lng,
                        address=booking.pickup_location or "Passenger Pickup Location",
                        description=f"Duty: {booking.customer.name} (Ref #{booking.booking_reference})"
                    )

        # 2. Status COMPLETED
        elif payload.status == "COMPLETED":
            comp_tmpl = db.query(MessageTemplate).filter(MessageTemplate.template_key == "booking_completed").first()
            if comp_tmpl:
                comp_msg = render_template(comp_tmpl.content, base_ctx)
            else:
                comp_msg = (
                    f"🚖 *PB08 TAXI — Ride Completed!*\n"
                    f"Dear {booking.customer.name}, your journey (Ref: #{booking.booking_reference}) has ended.\n"
                    f"Thank you for riding with PB08 TAXI! Call us anytime at {support_phone} for your next trip."
                )
            background_tasks.add_task(
                send_background_message,
                phone=booking.customer.whatsapp_number,
                message=comp_msg,
                message_type="RIDE_COMPLETED",
                customer_id=booking.customer_id
            )

        # 3. Status CANCELLED
        elif payload.status == "CANCELLED":
            canc_tmpl = db.query(MessageTemplate).filter(MessageTemplate.template_key == "booking_cancelled").first()
            if canc_tmpl:
                canc_msg = render_template(canc_tmpl.content, base_ctx)
            else:
                canc_msg = (
                    f"🚖 *PB08 TAXI — Booking Cancelled*\n"
                    f"Hello {booking.customer.name}, your taxi booking (Ref: #{booking.booking_reference}) has been cancelled.\n"
                    f"Reason: {booking.notes or 'Cancelled by operator'}\n"
                    f"Contact {support_phone} for assistance."
                )
            background_tasks.add_task(
                send_background_message,
                phone=booking.customer.whatsapp_number,
                message=canc_msg,
                message_type="BOOKING_CANCELLED",
                customer_id=booking.customer_id
            )

    latest_msg = (
        db.query(WhatsAppMessage)
        .filter(WhatsAppMessage.customer_id == booking.customer_id)
        .order_by(WhatsAppMessage.sent_at.desc())
        .first()
    )

    return BookingOut(
        id=booking.id,
        booking_reference=booking.booking_reference,
        customer_id=booking.customer_id,
        customer_name=booking.customer.name,
        whatsapp_number=booking.customer.whatsapp_number,
        driver_id=booking.driver_id,
        driver_name=booking.driver.name if booking.driver else None,
        driver_taxi_registration=booking.driver.taxi_registration if booking.driver else None,
        driver_contact=booking.driver.contact_number if booking.driver else None,
        car_name=booking.car_name or (booking.driver.car_name if booking.driver else None),
        pickup_location=booking.pickup_location,
        destination=booking.destination,
        pickup_date=booking.pickup_date,
        pickup_time=booking.pickup_time,
        pickup_lat=booking.pickup_lat,
        pickup_lng=booking.pickup_lng,
        google_maps_url=get_google_maps_url(booking.pickup_lat, booking.pickup_lng, booking.pickup_location),
        status=booking.status,
        notes=booking.notes,
        created_at=booking.created_at,
        whatsapp_status=latest_msg.status if latest_msg else "NONE"
    )
