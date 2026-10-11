import os
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.database import engine, Base, SessionLocal
from app.models import AdminUser, SliderImage
from app.security import hash_password
from app.routers import (
    public,
    auth,
    admin_dashboard,
    admin_customers,
    admin_bookings,
    admin_drivers,
    admin_slider,
    admin_whatsapp,
    admin_settings
)

settings = get_settings()

# Rate limiting
limiter = Limiter(key_func=get_remote_address)

# Ensure uploads directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def initialize_database():
    """Ensure database tables exist and seed initial admin & sample slides if empty."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # 1. Seed initial admin user if none exists
        admin_count = db.query(AdminUser).count()
        if admin_count == 0:
            default_admin = AdminUser(
                username=settings.ADMIN_USERNAME,
                email=settings.ADMIN_EMAIL,
                hashed_password=hash_password(settings.ADMIN_PASSWORD)
            )
            db.add(default_admin)
            db.commit()
            print(f"[PB08 TAXI] Initialized default admin: {settings.ADMIN_USERNAME}")

        # 2. Seed initial high-quality slider images if empty
        slider_count = db.query(SliderImage).count()
        if slider_count == 0:
            sample_slides = [
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
            db.add_all(sample_slides)
            db.commit()
            print("[PB08 TAXI] Initialized default homepage slider images")
    finally:
        db.close()

import asyncio
import httpx

async def keep_alive_background_worker():
    """
    Background worker that runs every 10 minutes to cross-ping
    the OpenWA WhatsApp gateway and the backend itself to keep services active.
    """
    await asyncio.sleep(60)  # Wait 1 minute after boot before starting pings
    openwa_health = f"{settings.OPENWA_BASE_URL.rstrip('/')}/health"
    backend_health = "https://pb08-taxi-api.onrender.com/api/health"

    while True:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                try:
                    res_wa = await client.get(openwa_health)
                    print(f"[KeepAlive] Pinged OpenWA: HTTP {res_wa.status_code}")
                except Exception as ex:
                    print(f"[KeepAlive] OpenWA ping notice: {ex}")

                try:
                    res_be = await client.get(backend_health)
                    print(f"[KeepAlive] Pinged Backend: HTTP {res_be.status_code}")
                except Exception as ex:
                    print(f"[KeepAlive] Backend ping notice: {ex}")
        except Exception as e:
            print(f"[KeepAlive] Worker loop exception: {e}")

        await asyncio.sleep(600)  # Ping every 10 minutes (600s)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables and seed initial data
    try:
        initialize_database()
    except Exception as e:
        print(f"[PB08 TAXI] Warning during startup database init: {e}")

    # Start 24/7 background keep-alive task
    bg_task = asyncio.create_task(keep_alive_background_worker())

    yield

    # Graceful shutdown
    bg_task.cancel()
    try:
        await bg_task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title="PB08 TAXI API",
    description="Backend API for PB08 TAXI booking service with Neon PostgreSQL and OpenWA WhatsApp Gateway.",
    version="1.0.0",
    lifespan=lifespan
)

# Attach rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Compression setup for fast payload delivery
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Mount static uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(public.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(admin_dashboard.router, prefix="/api")
app.include_router(admin_customers.router, prefix="/api")
app.include_router(admin_bookings.router, prefix="/api")
app.include_router(admin_drivers.router, prefix="/api")
app.include_router(admin_slider.router, prefix="/api")
app.include_router(admin_whatsapp.router, prefix="/api")
app.include_router(admin_settings.router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "Welcome to PB08 TAXI API Gateway",
        "docs": "/docs",
        "health": "/api/health",
        "keepalive": "/api/keepalive"
    }

@app.get("/api/keepalive")
async def keepalive():
    """
    Public 24/7 Keep-Alive heartbeat endpoint.
    When pinged, it keeps the backend alive and actively pings OpenWA to keep it awake too.
    """
    openwa_health = f"{settings.OPENWA_BASE_URL.rstrip('/')}/health"
    wa_status = "offline"
    wa_code = 0
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(openwa_health)
            wa_code = res.status_code
            wa_status = "online" if res.status_code == 200 else f"http_{res.status_code}"
    except Exception as e:
        wa_status = f"unreachable: {str(e)}"

    return {
        "status": "awake",
        "backend": "online",
        "openwa_gateway": wa_status,
        "openwa_code": wa_code,
        "timestamp": datetime.utcnow().isoformat()
    }

