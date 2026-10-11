from datetime import datetime, date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import AdminUser, Customer, Booking, WhatsAppMessage
from app.schemas import DashboardStats
from app.security import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retrieve summary dashboard metrics for PB08 TAXI administrator."""
    total_customers = db.query(Customer).count()
    total_bookings = db.query(Booking).count()

    today_start = datetime.combine(date.today(), datetime.min.time())
    today_bookings = db.query(Booking).filter(Booking.created_at >= today_start).count()

    pending_bookings = db.query(Booking).filter(Booking.status == "PENDING").count()
    confirmed_bookings = db.query(Booking).filter(Booking.status == "CONFIRMED").count()
    completed_bookings = db.query(Booking).filter(Booking.status == "COMPLETED").count()

    whatsapp_sent = db.query(WhatsAppMessage).filter(WhatsAppMessage.status == "SENT").count()
    whatsapp_failed = db.query(WhatsAppMessage).filter(WhatsAppMessage.status == "FAILED").count()

    eligible_offers = db.query(Customer).filter(Customer.marketing_consent == True).count()

    return DashboardStats(
        total_customers=total_customers,
        total_bookings=total_bookings,
        today_bookings=today_bookings,
        pending_bookings=pending_bookings,
        confirmed_bookings=confirmed_bookings,
        completed_bookings=completed_bookings,
        whatsapp_sent_count=whatsapp_sent,
        whatsapp_failed_count=whatsapp_failed,
        eligible_offers_count=eligible_offers
    )
