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

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_reference = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    pickup_location = Column(String(255), nullable=True)
    destination = Column(String(255), nullable=True)
    pickup_date = Column(String(50), nullable=True)
    pickup_time = Column(String(50), nullable=True)
    status = Column(String(50), default="PENDING", nullable=False)  # PENDING, CONFIRMED, COMPLETED, CANCELLED
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    customer = relationship("Customer", back_populates="bookings")

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
