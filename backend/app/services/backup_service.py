import os
import json
from typing import Dict, Any, Tuple
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text

BACKUP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backups")
os.makedirs(BACKUP_DIR, exist_ok=True)
LATEST_BACKUP_PATH = os.path.join(BACKUP_DIR, "latest_db_backup.json")

def dump_database_to_dict(db: Session) -> Dict[str, Any]:
    """Export complete snapshot of all tables and records."""
    tables = [
        'system_settings',
        'message_templates',
        'fleet_cars',
        'slider_images',
        'drivers',
        'customers',
        'bookings',
        'marketing_consents',
        'admin_users'
    ]
    dump = {
        "timestamp": datetime.utcnow().isoformat(),
        "tables": {}
    }

    for t in tables:
        try:
            result = db.execute(text(f"SELECT * FROM {t}")).fetchall()
            if result:
                keys = db.execute(text(f"SELECT * FROM {t} LIMIT 1")).keys()
                dump["tables"][t] = [
                    dict(zip(keys, [str(v) if v is not None else None for v in row]))
                    for row in result
                ]
            else:
                dump["tables"][t] = []
        except Exception as e:
            dump["tables"][t] = []
            print(f"[!] Backup warning for table {t}: {e}")

    return dump

def save_backup_file(db: Session) -> str:
    """Save latest backup to disk and return path."""
    data = dump_database_to_dict(db)
    with open(LATEST_BACKUP_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    return LATEST_BACKUP_PATH

def restore_database_from_dict(db: Session, data: Dict[str, Any]) -> Tuple[int, int]:
    """
    Restore tables and settings from dictionary into active database.
    Returns (restored_settings_count, restored_tables_count).
    """
    from app.models import SystemSetting, MessageTemplate, FleetCar, SliderImage, Driver, Customer, Booking, AdminUser, MarketingConsent

    raw_tables = data.get("tables")
    tables_data = raw_tables if isinstance(raw_tables, dict) else data
    restored_settings = 0
    restored_items = 0

    # 1. System Settings
    settings_list = tables_data.get("system_settings", [])
    for s in settings_list:
        k = s.get("key")
        v = s.get("value")
        if k:
            existing = db.query(SystemSetting).filter(SystemSetting.key == k).first()
            if not existing:
                db.add(SystemSetting(key=k, value=v, updated_at=datetime.utcnow()))
            else:
                existing.value = v
                existing.updated_at = datetime.utcnow()
            restored_settings += 1

    # 2. Message Templates
    templates_list = tables_data.get("message_templates", [])
    for t in templates_list:
        k = t.get("template_key")
        if k:
            existing = db.query(MessageTemplate).filter(MessageTemplate.template_key == k).first()
            if not existing:
                db.add(MessageTemplate(
                    template_key=k,
                    title=t.get("title", k),
                    content=t.get("content", ""),
                    variables_hint=t.get("variables_hint"),
                    updated_at=datetime.utcnow()
                ))
            else:
                existing.content = t.get("content", existing.content)
            restored_items += 1

    # 3. Fleet Cars
    cars_list = tables_data.get("fleet_cars", [])
    for c in cars_list:
        name = c.get("name")
        if name:
            existing = db.query(FleetCar).filter(FleetCar.name == name).first()
            if not existing:
                db.add(FleetCar(
                    name=name,
                    category=c.get("category", "Sedan"),
                    seating_capacity=c.get("seating_capacity", "4+1 Seater"),
                    is_active=str(c.get("is_active", "True")).lower() in ("true", "1")
                ))
                restored_items += 1

    # 4. Slider Images
    sliders_list = tables_data.get("slider_images", [])
    for s in sliders_list:
        title = s.get("title")
        if title:
            existing = db.query(SliderImage).filter(SliderImage.title == title).first()
            if not existing:
                db.add(SliderImage(
                    title=title,
                    subtitle=s.get("subtitle", ""),
                    image_url=s.get("image_url", ""),
                    sort_order=int(s.get("sort_order", 0)) if s.get("sort_order") else 0,
                    is_active=str(s.get("is_active", "True")).lower() in ("true", "1")
                ))
                restored_items += 1

    # 5. Drivers
    drivers_list = tables_data.get("drivers", [])
    for d in drivers_list:
        reg = d.get("taxi_registration")
        if reg:
            existing = db.query(Driver).filter(Driver.taxi_registration == reg).first()
            if not existing:
                db.add(Driver(
                    name=d.get("name", "Driver"),
                    taxi_registration=reg,
                    contact_number=d.get("contact_number", ""),
                    car_name=d.get("car_name"),
                    is_active=str(d.get("is_active", "True")).lower() in ("true", "1")
                ))
                restored_items += 1

    # 6. Admin Users
    admin_list = tables_data.get("admin_users", [])
    for a in admin_list:
        uname = a.get("username")
        if uname:
            existing = db.query(AdminUser).filter(AdminUser.username == uname).first()
            if not existing:
                db.add(AdminUser(
                    username=uname,
                    email=a.get("email", f"{uname}@pb08taxi.com"),
                    hashed_password=a.get("hashed_password")
                ))
                restored_items += 1

    # 7. Customers
    cust_map = {}
    customers_list = tables_data.get("customers", [])
    for c in customers_list:
        phone = c.get("whatsapp_number")
        if phone:
            existing = db.query(Customer).filter(Customer.whatsapp_number == phone).first()
            if not existing:
                new_c = Customer(
                    name=c.get("name", "Valued Customer"),
                    whatsapp_number=phone,
                    marketing_consent=str(c.get("marketing_consent", "True")).lower() in ("true", "1"),
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(new_c)
                db.flush()
                cust_map[c.get("id")] = new_c.id
            else:
                cust_map[c.get("id")] = existing.id
            restored_items += 1

    # 8. Bookings
    bookings_list = tables_data.get("bookings", [])
    for b in bookings_list:
        ref = b.get("booking_reference")
        if ref:
            existing = db.query(Booking).filter(Booking.booking_reference == ref).first()
            if not existing:
                cid = cust_map.get(b.get("customer_id"))
                if not cid:
                    first_cust = db.query(Customer).first()
                    cid = first_cust.id if first_cust else 1
                db.add(Booking(
                    booking_reference=ref,
                    customer_id=cid,
                    car_name=b.get("car_name"),
                    trip_type=b.get("trip_type", "One Way Trip"),
                    pickup_location=b.get("pickup_location"),
                    destination=b.get("destination"),
                    pickup_date=b.get("pickup_date"),
                    pickup_time=b.get("pickup_time"),
                    pickup_lat=float(b.get("pickup_lat")) if b.get("pickup_lat") else None,
                    pickup_lng=float(b.get("pickup_lng")) if b.get("pickup_lng") else None,
                    status=b.get("status", "PENDING"),
                    notes=b.get("notes"),
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                ))
                restored_items += 1

    db.commit()
    return restored_settings, restored_items
