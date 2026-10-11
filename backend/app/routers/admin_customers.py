from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.database import get_db
from app.models import AdminUser, Customer, Booking
from app.schemas import CustomerOut
from app.security import get_current_admin

router = APIRouter(prefix="/admin/customers", tags=["Admin Customers"])

@router.get("", response_model=List[CustomerOut])
def list_customers(
    q: Optional[str] = Query(None, description="Search by customer name or phone number"),
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    List customers with total booking count.
    Supports real-time search by name or WhatsApp number.
    """
    query = db.query(
        Customer,
        func.count(Booking.id).label("total_bookings")
    ).outerjoin(Booking, Booking.customer_id == Customer.id)

    if q and q.strip():
        search_term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Customer.name.ilike(search_term),
                Customer.whatsapp_number.ilike(search_term)
            )
        )

    query = query.group_by(Customer.id).order_by(Customer.created_at.desc())
    results = query.all()

    out = []
    for cust, count in results:
        out.append(
            CustomerOut(
                id=cust.id,
                name=cust.name,
                whatsapp_number=cust.whatsapp_number,
                marketing_consent=cust.marketing_consent,
                created_at=cust.created_at,
                updated_at=cust.updated_at,
                total_bookings=count
            )
        )
    return out

@router.patch("/{customer_id}/consent")
def update_customer_consent(
    customer_id: int,
    marketing_consent: bool,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update marketing consent / opt-out for customer."""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    customer.marketing_consent = marketing_consent
    db.commit()
    return {"id": customer.id, "marketing_consent": customer.marketing_consent}
