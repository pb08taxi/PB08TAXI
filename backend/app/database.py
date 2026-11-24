import os
import re
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.pool import NullPool
from app.config import get_settings

logger = logging.getLogger("pb08taxi.database")

settings = get_settings()

PRIMARY_PROJECT_NAME = "PB08TAXI"
ALT_PROJECT_NAME = "PB08TAXI-ALT"

DEFAULT_PRIMARY_URL = "postgresql://neondb_owner:npg_6rYECp1ejLUz@ep-divine-resonance-b42a27au-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require"
DEFAULT_ALT_URL = "postgresql://neondb_owner:npg_LYNzgeRbd84k@ep-green-pine-bekhupju-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require"

def _normalize_db_url(url: str) -> str:
    if not url:
        return ""
    clean = url.strip()
    # Strip channel_binding if present as standard psycopg2 handles sslmode=require
    clean = re.sub(r"[&?]channel_binding=[^&]+", "", clean)
    if clean.startswith("postgres://"):
        clean = clean.replace("postgres://", "postgresql://", 1)
    if "postgresql" in clean and "sslmode" not in clean:
        delimiter = "&" if "?" in clean else "?"
        clean = f"{clean}{delimiter}sslmode=require"
    return clean

class DualNeonManager:
    def __init__(self):
        # Allow environment variables or fallbacks
        primary_env = os.getenv("NEON_DB_PRIMARY_URL") or os.getenv("DATABASE_URL_PRIMARY") or DEFAULT_PRIMARY_URL
        alt_env = os.getenv("NEON_DB_ALT_URL") or os.getenv("DATABASE_URL") or DEFAULT_ALT_URL

        # If DATABASE_URL is set to something else (e.g. Render or Alt), use it appropriately
        main_env = os.getenv("DATABASE_URL", "").strip()
        if "ep-green-pine" in main_env:
            alt_env = main_env
        elif "ep-divine-resonance" in main_env:
            primary_env = main_env

        self.projects = {
            PRIMARY_PROJECT_NAME: {
                "name": PRIMARY_PROJECT_NAME,
                "url": _normalize_db_url(primary_env),
                "host": "ep-divine-resonance-b42a27au",
                "label": "PB08TAXI (Primary Project)",
            },
            ALT_PROJECT_NAME: {
                "name": ALT_PROJECT_NAME,
                "url": _normalize_db_url(alt_env),
                "host": "ep-green-pine-bekhupju",
                "label": "PB08TAXI-ALT (Alternate Project)",
            }
        }

        # Default to ALT because Primary is currently quota exceeded
        preferred = os.getenv("ACTIVE_DB_PROJECT", ALT_PROJECT_NAME).strip()
        self.active_project_name = preferred if preferred in self.projects else ALT_PROJECT_NAME
        self.auto_switch_enabled = True
        self.last_sync_time: Optional[str] = None
        self._engines: Dict[str, Any] = {}
        self._sessionmakers: Dict[str, Any] = {}

    def get_engine(self, project_name: str):
        if project_name not in self._engines:
            proj = self.projects.get(project_name)
            if not proj or not proj["url"]:
                raise ValueError(f"Project '{project_name}' has no connection URL configured.")
            
            engine = create_engine(
                proj["url"],
                poolclass=NullPool,
                connect_args={"sslmode": "require"} if "postgresql" in proj["url"] else {}
            )
            self._engines[project_name] = engine
            self._sessionmakers[project_name] = sessionmaker(autocommit=False, autoflush=False, bind=engine)

        return self._engines[project_name]

    def get_sessionmaker(self, project_name: str):
        self.get_engine(project_name)
        return self._sessionmakers[project_name]

    def get_active_session(self) -> Session:
        """Returns a database session from the active project with auto-failover."""
        # Try active project first
        try:
            sm = self.get_sessionmaker(self.active_project_name)
            session = sm()
            # Fast ping test
            session.execute(text("SELECT 1"))
            return session
        except Exception as e:
            err_str = str(e)
            logger.warning(f"[AUTO-FAILOVER TRIGGERED] Active DB {self.active_project_name} failed: {err_str}")
            
            if self.auto_switch_enabled:
                # Switch to partner project
                partner_name = ALT_PROJECT_NAME if self.active_project_name == PRIMARY_PROJECT_NAME else PRIMARY_PROJECT_NAME
                logger.info(f"[AUTO-FAILOVER] Switching from {self.active_project_name} to {partner_name}...")
                try:
                    sm_partner = self.get_sessionmaker(partner_name)
                    session = sm_partner()
                    session.execute(text("SELECT 1"))
                    self.active_project_name = partner_name
                    logger.info(f"[AUTO-FAILOVER SUCCESS] Active DB is now {partner_name}")
                    return session
                except Exception as partner_err:
                    logger.error(f"[AUTO-FAILOVER FAILED] Partner DB {partner_name} also failed: {partner_err}")
            
            # If all fail, re-raise original error
            raise e

    def check_project_health(self, project_name: str) -> Dict[str, Any]:
        """Check live connectivity and quota status of a specific project."""
        proj = self.projects.get(project_name)
        if not proj:
            return {"status": "error", "message": "Unknown project"}

        start = datetime.utcnow()
        try:
            eng = self.get_engine(project_name)
            with eng.connect() as conn:
                res = conn.execute(text("SELECT 1;")).fetchone()
                latency_ms = round((datetime.utcnow() - start).total_seconds() * 1000, 1)
                return {
                    "name": project_name,
                    "host": proj["host"],
                    "status": "online",
                    "latency_ms": latency_ms,
                    "is_active": self.active_project_name == project_name,
                    "message": "Operational & Responsive"
                }
        except Exception as ex:
            err_msg = str(ex)
            status_code = "error"
            if "exceeded the quota" in err_msg.lower():
                status_code = "quota_exceeded"
                display_msg = "Quota Exceeded (Awaiting Monthly Reset / Topup)"
            elif "password" in err_msg.lower() or "auth" in err_msg.lower():
                status_code = "auth_error"
                display_msg = "Authentication Failed"
            else:
                display_msg = f"Unreachable: {err_msg[:120]}"

            return {
                "name": project_name,
                "host": proj["host"],
                "status": status_code,
                "is_active": self.active_project_name == project_name,
                "message": display_msg
            }

    def switch_active_project(self, target_project_name: str) -> Dict[str, Any]:
        """Manually switch active database project."""
        if target_project_name not in self.projects:
            raise ValueError(f"Invalid target project: {target_project_name}. Choose {PRIMARY_PROJECT_NAME} or {ALT_PROJECT_NAME}")

        # Check health of target
        health = self.check_project_health(target_project_name)
        if health["status"] != "online":
            raise RuntimeError(f"Cannot switch to {target_project_name}: {health['message']}")

        self.active_project_name = target_project_name
        return {
            "success": True,
            "active_project": self.active_project_name,
            "message": f"Successfully switched active database to {target_project_name}"
        }

    def sync_between_projects(self) -> Dict[str, Any]:
        """Synchronize all tables and settings from active DB to partner DB."""
        from app.services.backup_service import dump_database_to_dict, restore_database_from_dict

        source_name = self.active_project_name
        target_name = ALT_PROJECT_NAME if source_name == PRIMARY_PROJECT_NAME else PRIMARY_PROJECT_NAME

        # Verify target is reachable
        target_health = self.check_project_health(target_name)
        if target_health["status"] != "online":
            raise RuntimeError(f"Target database '{target_name}' is not online ({target_health['message']}). Cannot replicate.")

        # Read from source
        source_sm = self.get_sessionmaker(source_name)
        with source_sm() as source_db:
            snapshot = dump_database_to_dict(source_db)

        # Write to target
        target_sm = self.get_sessionmaker(target_name)
        with target_sm() as target_db:
            from app.models import Base
            Base.metadata.create_all(bind=self.get_engine(target_name))
            s_count, i_count = restore_database_from_dict(target_db, snapshot)

        self.last_sync_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        return {
            "success": True,
            "source_project": source_name,
            "target_project": target_name,
            "settings_synced": s_count,
            "records_synced": i_count,
            "synced_at": self.last_sync_time
        }

# Global Singleton Manager
dual_neon_mgr = DualNeonManager()

# Default Engine for Alembic and Base migrations
engine = dual_neon_mgr.get_engine(dual_neon_mgr.active_project_name)
SessionLocal = dual_neon_mgr.get_sessionmaker(dual_neon_mgr.active_project_name)
Base = declarative_base()

def get_db():
    """Yields active session with automatic failover."""
    db = dual_neon_mgr.get_active_session()
    try:
        yield db
    finally:
        db.close()
