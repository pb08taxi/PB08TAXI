from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import AdminUser, Booking, Customer, WhatsAppMessage
from app.schemas import BookingOut, BookingStatusUpdate
from app.security import get_current_admin

router = APIRouter(prefix="/admin/bookings", tags=["Admin Bookings"])

@router.get("", response_model=List[BookingOut])
def list_bookings(
    status_filter: Optional[str] = Query(None, description="Filter by status (PENDING, CONFIRMED, COMPLETED, CANCELLED)"),
    q: Optional[str] = Query(None, description="Search by ref, customer name, or phone"),
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List bookings with customer details and status filtering."""
    query = db.query(Booking).join(Customer, Customer.id == Booking.customer_id)

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
            )
        )

    bookings = query.order_by(Booking.created_at.desc()).all()

    out = []
    for b in bookings:
        # Get latest whatsapp status for this customer/booking if any
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
                pickup_location=b.pickup_location,
                destination=b.destination,
                status=b.status,
                notes=b.notes,
                created_at=b.created_at,
                whatsapp_status=wa_status
            )
        )
    return out

@router.patch("/{booking_id}/status", response_model=BookingOut)
def update_booking_status(
    booking_id: int,
    payload: BookingStatusUpdate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update status (PENDING, CONFIRMED, COMPLETED, CANCELLED) and optional notes."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    booking.status = payload.status
    if payload.notes is not None:
        booking.notes = payload.notes
    booking.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(booking)

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
        pickup_location=booking.pickup_location,
        destination=booking.destination,
        status=booking.status,
        notes=booking.notes,
        created_at=booking.created_at,
        whatsapp_status=latest_msg.status if latest_msg else "NONE"
    )
