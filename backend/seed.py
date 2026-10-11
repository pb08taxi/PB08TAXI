"""
Seed script for PB08 TAXI.
Initializes tables and seeds default admin user and initial homepage slider images.
Can be executed directly: python seed.py
"""
import sys
import os

# Add parent directory to path so app modules can be loaded
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.models import AdminUser, SliderImage
from app.config import get_settings
from app.security import hash_password

settings = get_settings()

def run_seed():
    print("[PB08 TAXI] Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Admin User
        admin = db.query(AdminUser).filter(AdminUser.username == settings.ADMIN_USERNAME).first()
        if not admin:
            admin = AdminUser(
                username=settings.ADMIN_USERNAME,
                email=settings.ADMIN_EMAIL,
                hashed_password=hash_password(settings.ADMIN_PASSWORD)
            )
            db.add(admin)
            db.commit()
            print(f"[PB08 TAXI] Created admin user: '{settings.ADMIN_USERNAME}' with password '{settings.ADMIN_PASSWORD}'")
        else:
            print(f"[PB08 TAXI] Admin user '{settings.ADMIN_USERNAME}' already exists.")

        # 2. Slider Images
        slide_count = db.query(SliderImage).count()
        if slide_count == 0:
            slides = [
                SliderImage(
                    title="PB08 TAXI — 24/7 Premium Cabs in Punjab",
                    subtitle="Reliable, Safe & Air-Conditioned Rides at Affordable Fixed Rates",
                    image_url="https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1600&q=80",
                    sort_order=1,
                    is_active=True
                ),
                SliderImage(
                    title="Airport Pickups & Outstation Journeys",
                    subtitle="Direct transfers to Amritsar, Chandigarh & Delhi Airports with On-Time Guarantee",
                    image_url="https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?auto=format&fit=crop&w=1600&q=80",
                    sort_order=2,
                    is_active=True
                ),
                SliderImage(
                    title="Verified Drivers & Sanitized Fleet",
                    subtitle="Instant WhatsApp Confirmation & Dedicated Customer Support",
                    image_url="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1600&q=80",
                    sort_order=3,
                    is_active=True
                )
            ]
            db.add_all(slides)
            db.commit()
            print(f"[PB08 TAXI] Seeded {len(slides)} default slider images.")
        else:
            print(f"[PB08 TAXI] Slider images already exist ({slide_count} slides).")

        print("[PB08 TAXI] Database initialization and seeding completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
