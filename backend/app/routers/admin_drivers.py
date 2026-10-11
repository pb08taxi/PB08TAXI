from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import AdminUser, Driver, Booking, FleetCar
from app.schemas import (
    DriverOut, 
    DriverCreate, 
    DriverUpdate,
    FleetCarOut,
    FleetCarCreate,
    FleetCarUpdate
)
from app.security import get_current_admin

router = APIRouter(prefix="/admin/drivers", tags=["Admin Drivers"])

# ==============================================================================
# FLEET CARS MANAGEMENT (Add, Edit, Remove, List)
# ==============================================================================

@router.get("/cars", response_model=List[FleetCarOut])
def list_fleet_cars(
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all fleet cars with count of active assigned drivers."""
    cars = db.query(FleetCar).order_by(FleetCar.id.asc()).all()
    out = []
    for c in cars:
        # Count how many drivers have this car name assigned
        drivers_cnt = db.query(Driver).filter(Driver.car_name == c.name).count()
        out.append(
            FleetCarOut(
                id=c.id,
                name=c.name,
                category=c.category or "Sedan",
                seating_capacity=c.seating_capacity or "4+1 Seater",
                is_active=c.is_active,
                created_at=c.created_at,
                updated_at=c.updated_at,
                drivers_count=drivers_cnt
            )
        )
    return out

@router.post("/cars", response_model=FleetCarOut, status_code=status.HTTP_201_CREATED)
def create_fleet_car(
    payload: FleetCarCreate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Add a new car model to the fleet."""
    car_name = payload.name.strip()
    existing = db.query(FleetCar).filter(FleetCar.name.ilike(car_name)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Car model '{car_name}' already exists in fleet."
        )

    car = FleetCar(
        name=car_name,
        category=payload.category.strip() if payload.category else "Sedan",
        seating_capacity=payload.seating_capacity.strip() if payload.seating_capacity else "4+1 Seater",
        is_active=payload.is_active,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(car)
    db.commit()
    db.refresh(car)

    return FleetCarOut(
        id=car.id,
        name=car.name,
        category=car.category,
        seating_capacity=car.seating_capacity,
        is_active=car.is_active,
        created_at=car.created_at,
        updated_at=car.updated_at,
        drivers_count=0
    )

@router.put("/cars/{car_id}", response_model=FleetCarOut)
def update_fleet_car(
    car_id: int,
    payload: FleetCarUpdate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Edit an existing car in the fleet."""
    car = db.query(FleetCar).filter(FleetCar.id == car_id).first()
    if not car:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Car not found")

    old_name = car.name
    if payload.name is not None and payload.name.strip():
        new_name = payload.name.strip()
        # Check duplicate
        dup = db.query(FleetCar).filter(FleetCar.name.ilike(new_name), FleetCar.id != car_id).first()
        if dup:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Another car model '{new_name}' already exists."
            )
        car.name = new_name
        # Update any drivers that had the old name
        db.query(Driver).filter(Driver.car_name == old_name).update(
            {Driver.car_name: new_name},
            synchronize_session=False
        )

    if payload.category is not None:
        car.category = payload.category.strip()
    if payload.seating_capacity is not None:
        car.seating_capacity = payload.seating_capacity.strip()
    if payload.is_active is not None:
        car.is_active = payload.is_active

    car.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(car)

    drivers_cnt = db.query(Driver).filter(Driver.car_name == car.name).count()
    return FleetCarOut(
        id=car.id,
        name=car.name,
        category=car.category,
        seating_capacity=car.seating_capacity,
        is_active=car.is_active,
        created_at=car.created_at,
        updated_at=car.updated_at,
        drivers_count=drivers_cnt
    )

@router.delete("/cars/{car_id}")
def delete_fleet_car(
    car_id: int,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a car from the fleet."""
    car = db.query(FleetCar).filter(FleetCar.id == car_id).first()
    if not car:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Car not found")

    car_name = car.name
    db.delete(car)
    db.commit()
    return {"message": f"Car '{car_name}' removed from fleet successfully", "id": car_id}

# ==============================================================================
# DRIVERS MANAGEMENT
# ==============================================================================

@router.get("", response_model=List[DriverOut])
def list_drivers(
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all drivers with total assigned rides count and car name."""
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
                car_name=d.car_name,
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
    """Add a new taxi driver with taxi registration number, contact, and selected car."""
    driver = Driver(
        name=payload.name.strip(),
        taxi_registration=payload.taxi_registration.strip().upper(),
        contact_number=payload.contact_number.strip(),
        car_name=payload.car_name.strip() if payload.car_name else None,
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
        car_name=driver.car_name,
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
    """Update driver profile, taxi registration, car name, or contact details."""
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")

    if payload.name is not None:
        driver.name = payload.name.strip()
    if payload.taxi_registration is not None:
        driver.taxi_registration = payload.taxi_registration.strip().upper()
    if payload.contact_number is not None:
        driver.contact_number = payload.contact_number.strip()
    if payload.car_name is not None:
        driver.car_name = payload.car_name.strip() if payload.car_name.strip() else None
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
        car_name=driver.car_name,
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
        car_name=driver.car_name,
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
