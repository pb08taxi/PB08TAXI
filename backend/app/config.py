import os
from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PORT: int = int(os.getenv("PORT", "8000"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
    
    # Database: Neon.tech PostgreSQL (or local fallback)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "supersecret-pb08-taxi-jwt-key-change-this-in-production-2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # Admin Defaults
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "PB08Taxi@2026!")
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@pb08taxi.com")
    
    # OpenWA WhatsApp Gateway (https://github.com/rmyndharis/OpenWA)
    OPENWA_BASE_URL: str = os.getenv("OPENWA_BASE_URL", "http://localhost:2785/api")
    OPENWA_API_KEY: str = os.getenv("OPENWA_API_KEY", "")
    OPENWA_SESSION_NAME: str = os.getenv("OPENWA_SESSION_NAME", "pb08-taxi")
    OPENWA_SIMULATOR_MODE: bool = os.getenv("OPENWA_SIMULATOR_MODE", "false").lower() in ("true", "1", "yes")
    
    # Contact & Brand
    SUPPORT_PHONE: str = os.getenv("SUPPORT_PHONE", "+919876543210")
    SUPPORT_WHATSAPP: str = os.getenv("SUPPORT_WHATSAPP", "+919876543210")
    BUSINESS_NAME: str = os.getenv("BUSINESS_NAME", "PB08 TAXI")

    # GitHub Brand Asset Storage (uploads to /Logo folder in repo)
    GITHUB_TOKEN: str = os.getenv("GITHUB_TOKEN", "")
    GITHUB_REPO: str = os.getenv("GITHUB_REPO", "pb08taxi/PB08TAXI")
    GITHUB_BRANCH: str = os.getenv("GITHUB_BRANCH", "main")

    @property
    def cors_origin_list(self) -> List[str]:
        if not self.CORS_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        case_sensitive = True
        extra = "allow"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
