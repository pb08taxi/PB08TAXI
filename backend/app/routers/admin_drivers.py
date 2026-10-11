from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import AdminUser, Driver, Booking
from app.schemas import DriverOut, DriverCreate, DriverUpdate
from app.security import get_current_admin

router = APIRouter(prefix="/admin/drivers", tags=["Admin Drivers"])

@router.get("", response_model=List[DriverOut])
def list_drivers(
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all drivers with total assigned rides count."""
    drivers_with_rides = (
        db.query(Driver, func.count(Booking.id).label("total_rides"))
        .outerjoin(Booking, Booking.driver_id == Driver.id)
        .group_by(Driver.id)
        .order_by(Driver.created_at.desc())
        .all()
    )

    out = []
    for d, rides in drivers_with_rides:
        out.append(
            DriverOut(
                id=d.id,
                name=d.name,
                taxi_registration=d.taxi_registration,
                contact_number=d.contact_number,
                is_active=d.is_active,
                created_at=d.created_at,
                updated_at=d.updated_at,
                total_rides=rides
            )
        )
    return out

@router.post("", response_model=DriverOut, status_code=status.HTTP_201_CREATED)
def create_driver(
    payload: DriverCreate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Add a new taxi driver with taxi registration number and contact."""
    driver = Driver(
        name=payload.name.strip(),
        taxi_registration=payload.taxi_registration.strip().upper(),
        contact_number=payload.contact_number.strip(),
        is_active=payload.is_active,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(driver)
    db.commit()
    db.refresh(driver)

    return DriverOut(
        id=driver.id,
        name=driver.name,
        taxi_registration=driver.taxi_registration,
        contact_number=driver.contact_number,
        is_active=driver.is_active,
        created_at=driver.created_at,
        updated_at=driver.updated_at,
        total_rides=0
    )

@router.put("/{driver_id}", response_model=DriverOut)
def update_driver(
    driver_id: int,
    payload: DriverUpdate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update driver profile, taxi registration, or contact details."""
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")

    if payload.name is not None:
        driver.name = payload.name.strip()
    if payload.taxi_registration is not None:
        driver.taxi_registration = payload.taxi_registration.strip().upper()
    if payload.contact_number is not None:
        driver.contact_number = payload.contact_number.strip()
    if payload.is_active is not None:
        driver.is_active = payload.is_active
    
    driver.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(driver)

    total_rides = db.query(Booking).filter(Booking.driver_id == driver.id).count()

    return DriverOut(
        id=driver.id,
        name=driver.name,
        taxi_registration=driver.taxi_registration,
        contact_number=driver.contact_number,
        is_active=driver.is_active,
        created_at=driver.created_at,
        updated_at=driver.updated_at,
        total_rides=total_rides
    )

@router.patch("/{driver_id}/toggle-active", response_model=DriverOut)
def toggle_driver_active(
    driver_id: int,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Toggle driver active/inactive availability state."""
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")

    driver.is_active = not driver.is_active
    driver.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(driver)

    total_rides = db.query(Booking).filter(Booking.driver_id == driver.id).count()

    return DriverOut(
        id=driver.id,
        name=driver.name,
        taxi_registration=driver.taxi_registration,
        contact_number=driver.contact_number,
        is_active=driver.is_active,
        created_at=driver.created_at,
        updated_at=driver.updated_at,
        total_rides=total_rides
    )

@router.delete("/{driver_id}")
def delete_driver(
    driver_id: int,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a driver record. Bookings will have driver_id set to NULL."""
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")

    db.delete(driver)
    db.commit()
    return {"message": f"Driver '{driver.name}' deleted successfully", "id": driver_id}
