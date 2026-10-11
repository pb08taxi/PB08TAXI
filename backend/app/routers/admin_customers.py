from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.database import get_db
from app.models import AdminUser, Customer, Booking
from app.schemas import CustomerOut, CustomerCreate, CustomerUpdate
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

@router.post("", response_model=CustomerOut, status_code=status.HTTP_201_CREATED)
def create_customer(
    payload: CustomerCreate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Manually add a new customer from admin panel."""
    # Check if customer already exists by phone
    existing = db.query(Customer).filter(Customer.whatsapp_number == payload.whatsapp_number).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Customer with phone number {payload.whatsapp_number} already exists"
        )

    customer = Customer(
        name=payload.name.strip(),
        whatsapp_number=payload.whatsapp_number.strip(),
        marketing_consent=payload.marketing_consent,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)

    return CustomerOut(
        id=customer.id,
        name=customer.name,
        whatsapp_number=customer.whatsapp_number,
        marketing_consent=customer.marketing_consent,
        created_at=customer.created_at,
        updated_at=customer.updated_at,
        total_bookings=0
    )

@router.put("/{customer_id}", response_model=CustomerOut)
def update_customer(
    customer_id: int,
    payload: CustomerUpdate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Edit customer profile details."""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    if payload.whatsapp_number is not None and payload.whatsapp_number != customer.whatsapp_number:
        existing = db.query(Customer).filter(Customer.whatsapp_number == payload.whatsapp_number).first()
        if existing and existing.id != customer.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Another customer already has phone number {payload.whatsapp_number}"
            )
        customer.whatsapp_number = payload.whatsapp_number

    if payload.name is not None:
        customer.name = payload.name.strip()
    if payload.marketing_consent is not None:
        customer.marketing_consent = payload.marketing_consent

    customer.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(customer)

    total_bookings = db.query(Booking).filter(Booking.customer_id == customer.id).count()

    return CustomerOut(
        id=customer.id,
        name=customer.name,
        whatsapp_number=customer.whatsapp_number,
        marketing_consent=customer.marketing_consent,
        created_at=customer.created_at,
        updated_at=customer.updated_at,
        total_bookings=total_bookings
    )

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
    customer.updated_at = datetime.utcnow()
    db.commit()
    return {"id": customer.id, "marketing_consent": customer.marketing_consent}

@router.delete("/{customer_id}")
def delete_customer(
    customer_id: int,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a customer and their associated bookings."""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    name = customer.name
    db.delete(customer)
    db.commit()
    return {"message": f"Customer '{name}' deleted successfully", "id": customer_id}
