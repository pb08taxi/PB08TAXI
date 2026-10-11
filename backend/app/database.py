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
    # Neon PostgreSQL connection
    # Ensure sslmode=require for Neon PostgreSQL if not already specified
    connect_args = {}
    if "postgresql" in db_url and "sslmode" not in db_url:
        connect_args["sslmode"] = "require"
        
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        pool_recycle=300,
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
