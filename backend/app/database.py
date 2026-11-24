import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import get_settings

settings = get_settings()

db_url = settings.DATABASE_URL.strip() if settings.DATABASE_URL else ""

# Handle postgres:// prefix from Render/Neon to standard postgresql://
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

if db_url:
    from sqlalchemy.pool import NullPool, QueuePool

    # Ensure sslmode=require for Neon / cloud PostgreSQL
    connect_args = {}
    if "postgresql" in db_url and "sslmode" not in db_url:
        connect_args["sslmode"] = "require"

    is_serverless = "neon.tech" in db_url or "supabase" in db_url

    if is_serverless:
        # Serverless PostgreSQL optimization (Neon / Supabase):
        # NullPool ensures connections are immediately closed after each request.
        # This allows Neon to auto-suspend after 5 min of inactivity,
        # preserving 100% of the free tier quota (0 compute hours wasted when idle)!
        engine = create_engine(
            db_url,
            poolclass=NullPool,
            connect_args=connect_args
        )
    else:
        # Dedicated PostgreSQL (Render / Self-hosted)
        engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_recycle=1800,
            pool_size=5,
            max_overflow=10,
            pool_timeout=30,
            connect_args=connect_args
        )
else:
    # Local fallback for development when Neon DATABASE_URL is not set
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sqlite_path = os.path.join(BASE_DIR, "pb08taxi.db")
    engine = create_engine(
        f"sqlite:///{sqlite_path}",
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
