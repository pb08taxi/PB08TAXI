from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator, field_serializer
import re

def normalize_phone_with_plus(v: str) -> str:
    """
    Globally standardize phone number to strictly include the '+' prefix.
    - If 10 digits (standard Indian mobile): '+91' + digits -> e.g. '+919876543210'
    - If 11 digits starting with 0: '+91' + digits[1:] -> e.g. '+919876543210'
    - If 12 digits starting with 91: '+' + digits -> e.g. '+919876543210'
    - If already starts with '+': ensure clean digits after '+', e.g. '+919876543210'
    - Otherwise, prepend '+' to all extracted digits if >= 8 digits.
    """
    if not v:
        raise ValueError("Phone number cannot be empty")
    cleaned = v.strip()
    digits = re.sub(r"\D", "", cleaned)
    if len(digits) == 10:
        return f"+91{digits}"
    elif len(digits) == 11 and digits.startswith("0"):
        return f"+91{digits[1:]}"
    elif len(digits) == 12 and digits.startswith("91"):
        return f"+{digits}"
    elif len(digits) >= 8:
        return f"+{digits}"
    else:
        raise ValueError("Invalid phone number: must be at least 8 digits")

def clean_phone(v: str) -> str:
    return normalize_phone_with_plus(v)

class CustomerBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    whatsapp_number: str = Field(..., min_length=8, max_length=50)
    marketing_consent: bool = True

    @field_validator("whatsapp_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        return clean_phone(v)

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    whatsapp_number: Optional[str] = Field(None, min_length=8, max_length=50)
    marketing_consent: Optional[bool] = None

    @field_validator("whatsapp_number")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return clean_phone(v)
        return v

class CustomerOut(CustomerBase):
    id: int
    created_at: datetime
    updated_at: datetime
    total_bookings: int = 0

    @field_serializer("created_at", "updated_at")
    def serialize_dates(self, dt: datetime, _info):
        if dt and dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat() if dt else None

    class Config:
        from_attributes = True

class BookingCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=150)
    whatsapp_number: str = Field(..., min_length=8, max_length=50)
    car_name: Optional[str] = Field(None, max_length=100)
    pickup_location: Optional[str] = Field(None, max_length=255)
    destination: Optional[str] = Field(None, max_length=255)
    pickup_date: Optional[str] = Field(None, max_length=50)
    pickup_time: Optional[str] = Field(None, max_length=50)
    pickup_lat: Optional[float] = None
    pickup_lng: Optional[float] = None
    marketing_consent: bool = True

    @field_validator("whatsapp_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        return clean_phone(v)

class FleetCarBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    category: Optional[str] = Field("Sedan", max_length=50)
    seating_capacity: Optional[str] = Field("4+1 Seater", max_length=30)
    is_active: bool = True

class FleetCarCreate(FleetCarBase):
    pass

class FleetCarUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    category: Optional[str] = Field(None, max_length=50)
    seating_capacity: Optional[str] = Field(None, max_length=30)
    is_active: Optional[bool] = None

class FleetCarOut(FleetCarBase):
    id: int
    created_at: datetime
    updated_at: datetime
    drivers_count: int = 0

    class Config:
        from_attributes = True

class DriverBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    taxi_registration: str = Field(..., min_length=3, max_length=50)  # e.g., PB01CC1372
    contact_number: str = Field(..., min_length=8, max_length=50)
    car_name: Optional[str] = Field(None, max_length=100)  # e.g., Toyota Innova Crysta
    is_active: bool = True

    @field_validator("contact_number")
    @classmethod
    def validate_contact(cls, v: str) -> str:
        return clean_phone(v)

class DriverCreate(DriverBase):
    pass

class DriverUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    taxi_registration: Optional[str] = Field(None, min_length=3, max_length=50)
    contact_number: Optional[str] = Field(None, min_length=8, max_length=50)
    car_name: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None

    @field_validator("contact_number")
    @classmethod
    def validate_contact(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return clean_phone(v)
        return v

class DriverOut(DriverBase):
    id: int
    created_at: datetime
    updated_at: datetime
    total_rides: int = 0

    @field_serializer("created_at", "updated_at")
    def serialize_dates(self, dt: datetime, _info):
        if dt and dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat() if dt else None

    class Config:
        from_attributes = True

class BookingStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(PENDING|CONFIRMED|COMPLETED|CANCELLED)$")
    notes: Optional[str] = None
    driver_id: Optional[int] = None
    send_whatsapp: bool = True

class BookingOut(BaseModel):
    id: int
    booking_reference: str
    customer_id: int
    customer_name: str
    whatsapp_number: str
    driver_id: Optional[int] = None
    driver_name: Optional[str] = None
    driver_taxi_registration: Optional[str] = None
    driver_contact: Optional[str] = None
    car_name: Optional[str] = None
    pickup_location: Optional[str] = None
    destination: Optional[str] = None
    pickup_date: Optional[str] = None
    pickup_time: Optional[str] = None
    pickup_lat: Optional[float] = None
    pickup_lng: Optional[float] = None
    google_maps_url: Optional[str] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime
    whatsapp_status: Optional[str] = None

    @field_serializer("created_at")
    def serialize_created_at(self, dt: datetime, _info):
        if dt and dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat() if dt else None

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

class DirectChatMessageIn(BaseModel):
    phone: str
    message: str = Field(..., min_length=1, max_length=2500)
    recipient_name: Optional[str] = None
    recipient_role: Optional[str] = "Customer"
    customer_id: Optional[int] = None
    booking_reference: Optional[str] = None

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

    @field_serializer("sent_at")
    def serialize_sent_at(self, dt: datetime, _info):
        if dt and dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat() if dt else None

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

    @field_validator("admin_alert_whatsapp_number")
    @classmethod
    def validate_admin_phone(cls, v: Optional[str]) -> Optional[str]:
        if v and v.strip():
            return normalize_phone_with_plus(v)
        return v

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
    support_phone: str = "+919888079736"
    whatsapp_number: str = "+919888079736"
    site_logo_url: Optional[str] = None
    site_favicon_url: Optional[str] = None
    site_logo_size: int = 48
    brand_title: str = "PB08 TAXI"
    brand_tagline: str = "Fast • Safe • Reliable"
    show_credentials_hint: bool = True
    booking_modal_animation: str = "golden-glow"
    slider_transition_effect: str = "fade"
    slider_fade_duration: int = 1000
    slider_autoplay_interval: int = 5500
    slider_overlay_opacity: int = 55
    slider_overlay_color: str = "#000000"
    social_facebook: Optional[str] = "https://facebook.com/pb08taxi"
    social_instagram: Optional[str] = "https://instagram.com/pb08taxi"
    social_twitter: Optional[str] = "https://twitter.com/pb08taxi"
    social_youtube: Optional[str] = "https://youtube.com/@pb08taxi"
    physical_address: str = "Model Town, Near BMC Chowk, Jalandhar, Punjab 144001, India"

class SiteSettingsUpdate(BaseModel):
    support_phone: Optional[str] = None
    whatsapp_number: Optional[str] = None
    site_logo_url: Optional[str] = None
    site_favicon_url: Optional[str] = None
    site_logo_size: Optional[int] = None
    brand_title: Optional[str] = None
    brand_tagline: Optional[str] = None
    show_credentials_hint: Optional[bool] = None
    booking_modal_animation: Optional[str] = None
    slider_transition_effect: Optional[str] = None
    slider_fade_duration: Optional[int] = None
    slider_autoplay_interval: Optional[int] = None
    slider_overlay_opacity: Optional[int] = None
    slider_overlay_color: Optional[str] = None
    social_facebook: Optional[str] = None
    social_instagram: Optional[str] = None
    social_twitter: Optional[str] = None
    social_youtube: Optional[str] = None
    physical_address: Optional[str] = None

    @field_validator("support_phone", "whatsapp_number")
    @classmethod
    def validate_site_phones(cls, v: Optional[str]) -> Optional[str]:
        if v and v.strip():
            return normalize_phone_with_plus(v)
        return v

class AdminCredentialsUpdate(BaseModel):
    current_password: str
    new_username: Optional[str] = None
    new_password: Optional[str] = None

class MessageTemplateOut(BaseModel):
    id: int
    template_key: str
    title: str
    content: str
    variables_hint: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True

class MessageTemplateUpdate(BaseModel):
    content: str = Field(..., min_length=1)

class FactoryResetRequest(BaseModel):
    secret_pin: str = Field(..., min_length=1, max_length=50)
    clear_bookings: bool = False
    clear_customers: bool = False
    clear_drivers: bool = False
    clear_whatsapp_logs: bool = False
    clear_marketing_consents: bool = False
    reset_slider_images: bool = False
    reset_message_templates: bool = False
    reset_site_settings: bool = False

class SEOSettingsOut(BaseModel):
    meta_title: str = "PB08 TAXI — 24/7 Jalandhar Taxi & Airport Cabs Punjab"
    meta_description: str = "PB08 TAXI — 24/7 reliable taxi & cab booking in Jalandhar, Punjab. Affordable airport transfers & outstation rides. Instant WhatsApp booking confirmation."
    meta_keywords: str = "PB08 TAXI, Jalandhar Taxi, Punjab Cab Service, Airport Taxi, Outstation Cab, Amritsar Airport Cab, Delhi Airport Transfer, Jalandhar Cab Service, Best Taxi in Punjab"
    canonical_url: str = "https://www.pb08taxi.com"
    robots_directive: str = "index, follow, max-image-preview:large"
    
    og_title: str = "PB08 TAXI — 24/7 Jalandhar Taxi & Airport Cabs Punjab"
    og_description: str = "PB08 TAXI — 24/7 reliable taxi & cab booking in Jalandhar, Punjab. Affordable airport transfers & outstation rides. Instant WhatsApp booking confirmation."
    og_image: str = "https://raw.githubusercontent.com/pb08taxi/PB08TAXI/main/Logo/pb08taxi-logo-1791751050.png"
    twitter_card: str = "summary_large_image"
    
    business_name: str = "PB08 TAXI"
    geo_region: str = "IN-PB"
    geo_placename: str = "Jalandhar, Punjab, India"
    geo_latitude: str = "31.3260"
    geo_longitude: str = "75.5762"
    service_areas: str = "Jalandhar, Amritsar, Ludhiana, Chandigarh, Delhi Airport (DEL), Amritsar Airport (ATQ), Phagwara, Kapurthala, Hoshiarpur, Punjab"
    
    google_site_verification: Optional[str] = None
    google_analytics_id: Optional[str] = None
    meta_pixel_id: Optional[str] = None
    schema_taxi_price_range: str = "₹₹"
    custom_head_code: Optional[str] = None
    looker_studio_embed_url: Optional[str] = None

class SEOSettingsUpdate(BaseModel):
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    canonical_url: Optional[str] = None
    robots_directive: Optional[str] = None
    
    og_title: Optional[str] = None
    og_description: Optional[str] = None
    og_image: Optional[str] = None
    twitter_card: Optional[str] = None
    
    business_name: Optional[str] = None
    geo_region: Optional[str] = None
    geo_placename: Optional[str] = None
    geo_latitude: Optional[str] = None
    geo_longitude: Optional[str] = None
    service_areas: Optional[str] = None
    
    google_site_verification: Optional[str] = None
    google_analytics_id: Optional[str] = None
    meta_pixel_id: Optional[str] = None
    schema_taxi_price_range: Optional[str] = None
    custom_head_code: Optional[str] = None
    looker_studio_embed_url: Optional[str] = None

class LookerStudioUrlUpdate(BaseModel):
    embed_url: str = Field(..., max_length=1000)

class LookerStudioUrlOut(BaseModel):
    embed_url: Optional[str] = None
    google_analytics_id: Optional[str] = None
    ga4_property_id: Optional[str] = "411659377"

class AnalyticsEventCreate(BaseModel):
    visitor_id: str = Field(..., max_length=64)
    event_type: str = Field(..., max_length=50)  # pageview, click_book_ride, click_call, click_whatsapp, open_booking_modal, submit_booking, click_route
    event_label: Optional[str] = Field(None, max_length=255)
    page_path: str = Field("/", max_length=255)
    device_type: str = Field("Mobile", max_length=30)
    browser: Optional[str] = Field(None, max_length=50)

class AnalyticsRecentEventOut(BaseModel):
    id: int
    visitor_id: str
    event_type: str
    event_label: Optional[str]
    page_path: str
    device_type: str
    browser: Optional[str]
    created_at: datetime

    @field_serializer("created_at")
    def serialize_created_at(self, dt: datetime, _info):
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()

    class Config:
        from_attributes = True

class AnalyticsDailyPoint(BaseModel):
    date: str
    visitors: int
    pageviews: int
    clicks: int
    bookings: int

class AnalyticsStatsOut(BaseModel):
    today_visitors: int
    today_pageviews: int
    today_calls: int
    today_whatsapps: int
    today_modal_opens: int
    today_bookings: int
    conversion_rate: float
    total_visitors_period: int
    total_pageviews_period: int
    total_clicks_period: int
    device_breakdown: dict
    clicks_by_category: dict
    daily_trends: List[AnalyticsDailyPoint]
    recent_events: List[AnalyticsRecentEventOut]

class GA4CredentialsUpdate(BaseModel):
    service_account_json: str
    property_id: Optional[str] = "411659377"

class GA4StatusOut(BaseModel):
    connected: bool
    property_id: str
    client_email: Optional[str] = None
    measurement_id: str = "G-MD0W9GNM7V"
    error: Optional[str] = None



