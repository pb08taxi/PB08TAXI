from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
import re

def clean_phone(v: str) -> str:
    cleaned = re.sub(r"[^\d+]", "", v.strip())
    # Strip leading zeros or invalid chars, ensure minimal length
    if len(cleaned.replace("+", "")) < 8:
        raise ValueError("WhatsApp number is too short or invalid")
    return cleaned

class CustomerBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    whatsapp_number: str = Field(..., min_length=8, max_length=50)
    marketing_consent: bool = True

    @field_validator("whatsapp_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        return clean_phone(v)

class CustomerOut(CustomerBase):
    id: int
    created_at: datetime
    updated_at: datetime
    total_bookings: int = 0

    class Config:
        from_attributes = True

class BookingCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=150)
    whatsapp_number: str = Field(..., min_length=8, max_length=50)
    pickup_location: Optional[str] = Field(None, max_length=255)
    destination: Optional[str] = Field(None, max_length=255)
    marketing_consent: bool = True

    @field_validator("whatsapp_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        return clean_phone(v)

class BookingStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(PENDING|CONFIRMED|COMPLETED|CANCELLED)$")
    notes: Optional[str] = None

class BookingOut(BaseModel):
    id: int
    booking_reference: str
    customer_id: int
    customer_name: str
    whatsapp_number: str
    pickup_location: Optional[str] = None
    destination: Optional[str] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime
    whatsapp_status: Optional[str] = None

    class Config:
        from_attributes = True

class SliderImageBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    subtitle: Optional[str] = Field(None, max_length=255)
    image_url: str = Field(..., max_length=1000)
    sort_order: int = 0
    is_active: bool = True

class SliderImageCreate(SliderImageBase):
    pass

class SliderImageUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    image_url: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None

class SliderImageOut(SliderImageBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class AdminLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    role: str = "admin"

class WhatsAppTestMessage(BaseModel):
    phone: str
    message: Optional[str] = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        return clean_phone(v)

class WhatsAppOfferRequest(BaseModel):
    message: str = Field(..., min_length=5, max_length=2000)

class WhatsAppMessageOut(BaseModel):
    id: int
    customer_id: Optional[int] = None
    phone: str
    message_type: str
    content: str
    status: str
    error_detail: Optional[str] = None
    sent_at: datetime

    class Config:
        from_attributes = True

class WhatsAppStatusOut(BaseModel):
    connected: bool
    status: str  # connected, qr_ready, disconnected, starting, offline
    session_id: Optional[str] = None
    phone: Optional[str] = None
    qr_code: Optional[str] = None
    details: Optional[str] = None
    provider: str = "OpenWA"

class WhatsAppSettingsIn(BaseModel):
    admin_alert_whatsapp_number: Optional[str] = None
    admin_alert_whatsapp_enabled: bool = True

class WhatsAppSettingsOut(BaseModel):
    admin_alert_whatsapp_number: Optional[str] = None
    admin_alert_whatsapp_enabled: bool = True

class DashboardStats(BaseModel):
    total_customers: int
    total_bookings: int
    today_bookings: int
    pending_bookings: int
    confirmed_bookings: int
    completed_bookings: int
    whatsapp_sent_count: int
    whatsapp_failed_count: int
    eligible_offers_count: int

class SiteSettingsOut(BaseModel):
    support_phone: str = "+91 98765 43210"
    whatsapp_number: str = "919876543210"
    site_logo_url: Optional[str] = None
    site_favicon_url: Optional[str] = None
    show_credentials_hint: bool = True

class SiteSettingsUpdate(BaseModel):
    support_phone: Optional[str] = None
    whatsapp_number: Optional[str] = None
    site_logo_url: Optional[str] = None
    site_favicon_url: Optional[str] = None
    show_credentials_hint: Optional[bool] = None

class AdminCredentialsUpdate(BaseModel):
    current_password: str
    new_username: Optional[str] = None
    new_password: Optional[str] = None

