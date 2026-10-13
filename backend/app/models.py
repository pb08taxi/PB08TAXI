from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    whatsapp_number = Column(String(50), unique=True, index=True, nullable=False)
    marketing_consent = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    bookings = relationship("Booking", back_populates="customer", cascade="all, delete-orphan")
    messages = relationship("WhatsAppMessage", back_populates="customer")
    consents = relationship("MarketingConsent", back_populates="customer", cascade="all, delete-orphan")

class FleetCar(Base):
    __tablename__ = "fleet_cars"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)  # e.g., Maruti Suzuki Dzire, Toyota Innova Crysta
    category = Column(String(50), nullable=True, default="Sedan")  # Sedan, SUV, MUV, Luxury, Hatchback, Van
    seating_capacity = Column(String(30), nullable=True, default="4+1 Seater")
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    taxi_registration = Column(String(50), nullable=False)  # e.g., PB01CC1372
    contact_number = Column(String(50), nullable=False)
    car_name = Column(String(100), nullable=True)  # e.g., Toyota Innova Crysta
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    bookings = relationship("Booking", back_populates="driver")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_reference = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id", ondelete="SET NULL"), nullable=True)
    car_name = Column(String(100), nullable=True)  # Preferred or assigned car name
    pickup_location = Column(String(255), nullable=True)
    destination = Column(String(255), nullable=True)
    pickup_date = Column(String(50), nullable=True)
    pickup_time = Column(String(50), nullable=True)
    status = Column(String(50), default="PENDING", nullable=False)  # PENDING, CONFIRMED, COMPLETED, CANCELLED
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    customer = relationship("Customer", back_populates="bookings")
    driver = relationship("Driver", back_populates="bookings")

class SliderImage(Base):
    __tablename__ = "slider_images"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    subtitle = Column(String(255), nullable=True)
    image_url = Column(String(1000), nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class WhatsAppMessage(Base):
    __tablename__ = "whatsapp_messages"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True)
    phone = Column(String(50), nullable=False, index=True)
    message_type = Column(String(50), nullable=False)  # BOOKING_CONFIRMATION, PROMOTIONAL_OFFER, TEST_MESSAGE
    content = Column(Text, nullable=False)
    status = Column(String(50), default="PENDING", nullable=False)  # SENT, FAILED, PENDING
    error_detail = Column(Text, nullable=True)
    sent_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    customer = relationship("Customer", back_populates="messages")

class MarketingConsent(Base):
    __tablename__ = "marketing_consents"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    phone = Column(String(50), nullable=False, index=True)
    consent_given = Column(Boolean, default=True, nullable=False)
    source = Column(String(50), default="booking_form", nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    customer = relationship("Customer", back_populates="consents")

class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class MessageTemplate(Base):
    __tablename__ = "message_templates"

    id = Column(Integer, primary_key=True, index=True)
    template_key = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(150), nullable=False)
    content = Column(Text, nullable=False)
    variables_hint = Column(String(500), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(Integer, primary_key=True, index=True)
    visitor_id = Column(String(64), index=True, nullable=False)
    event_type = Column(String(50), index=True, nullable=False)  # pageview, click_book_ride, click_call, click_whatsapp, open_booking_modal, submit_booking, click_route
    event_label = Column(String(255), nullable=True)
    page_path = Column(String(255), default="/", nullable=False)
    device_type = Column(String(30), default="Mobile", nullable=False)  # Mobile, Tablet, Desktop
    browser = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)

