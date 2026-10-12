import os
import uuid
import shutil
import base64
import httpx
from typing import Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    AdminUser,
    SystemSetting,
    Booking,
    Customer,
    Driver,
    WhatsAppMessage,
    MarketingConsent,
    SliderImage,
    MessageTemplate
)
from app.schemas import SiteSettingsOut, SiteSettingsUpdate, AdminCredentialsUpdate, FactoryResetRequest
from app.security import get_current_admin, verify_password, hash_password, create_access_token
from app.config import get_settings

settings_cfg = get_settings()

router = APIRouter(tags=["Site Settings"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def _get_setting_val(db: Session, key: str, default: str) -> str:
    item = db.query(SystemSetting).filter(SystemSetting.key == key).first()
    if item and item.value is not None:
        return item.value
    return default

def _set_setting_val(db: Session, key: str, val: str):
    item = db.query(SystemSetting).filter(SystemSetting.key == key).first()
    if not item:
        item = SystemSetting(key=key, value=val, updated_at=datetime.utcnow())
        db.add(item)
    else:
        item.value = val
        item.updated_at = datetime.utcnow()
    db.commit()

@router.get("/site-settings", response_model=SiteSettingsOut)
def get_public_site_settings(db: Session = Depends(get_db)):
    """Public endpoint to fetch current contact info, logo, favicon, brand title, tagline, login hint config, and booking animation."""
    support_phone = _get_setting_val(db, "support_phone", settings_cfg.SUPPORT_PHONE)
    whatsapp_number = _get_setting_val(db, "whatsapp_number", settings_cfg.SUPPORT_WHATSAPP)
    site_logo_url = _get_setting_val(db, "site_logo_url", "")
    site_favicon_url = _get_setting_val(db, "site_favicon_url", "")
    site_logo_size_raw = _get_setting_val(db, "site_logo_size", "48")
    try:
        site_logo_size = int(site_logo_size_raw)
    except (ValueError, TypeError):
        site_logo_size = 48
    brand_title = _get_setting_val(db, "brand_title", "PB08 TAXI")
    brand_tagline = _get_setting_val(db, "brand_tagline", "Fast • Safe • Reliable")
    show_hint_str = _get_setting_val(db, "show_credentials_hint", "false").lower()
    show_credentials_hint = show_hint_str in ("true", "1", "yes")
    booking_modal_animation = _get_setting_val(db, "booking_modal_animation", "golden-glow")

    return SiteSettingsOut(
        support_phone=support_phone,
        whatsapp_number=whatsapp_number,
        site_logo_url=site_logo_url or None,
        site_favicon_url=site_favicon_url or None,
        site_logo_size=site_logo_size,
        brand_title=brand_title or "PB08 TAXI",
        brand_tagline=brand_tagline or "Fast • Safe • Reliable",
        show_credentials_hint=show_credentials_hint,
        booking_modal_animation=booking_modal_animation or "golden-glow"
    )

@router.get("/admin/settings", response_model=Dict[str, Any])
def get_admin_site_settings(
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to fetch settings including current admin username."""
    public_settings = get_public_site_settings(db)
    return {
        **public_settings.model_dump(),
        "admin_username": admin.username,
        "admin_email": admin.email
    }

@router.post("/admin/settings", response_model=SiteSettingsOut)
def update_admin_site_settings(
    payload: SiteSettingsUpdate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to update phone numbers, logo/favicon URLs, brand texts, login hint display, and booking modal animation."""
    if payload.support_phone is not None:
        _set_setting_val(db, "support_phone", payload.support_phone.strip())
    
    if payload.whatsapp_number is not None:
        # Clean non-digits except +
        clean_wa = payload.whatsapp_number.strip().replace(" ", "").replace("-", "")
        _set_setting_val(db, "whatsapp_number", clean_wa)
        
    if payload.site_logo_url is not None:
        _set_setting_val(db, "site_logo_url", payload.site_logo_url.strip())
        
    if payload.site_favicon_url is not None:
        _set_setting_val(db, "site_favicon_url", payload.site_favicon_url.strip())

    if payload.site_logo_size is not None:
        bounded_size = max(20, min(150, payload.site_logo_size))
        _set_setting_val(db, "site_logo_size", str(bounded_size))

    if payload.brand_title is not None:
        _set_setting_val(db, "brand_title", payload.brand_title.strip() or "PB08 TAXI")

    if payload.brand_tagline is not None:
        _set_setting_val(db, "brand_tagline", payload.brand_tagline.strip() or "Fast • Safe • Reliable")
        
    if payload.show_credentials_hint is not None:
        _set_setting_val(db, "show_credentials_hint", "true" if payload.show_credentials_hint else "false")

    if payload.booking_modal_animation is not None:
        _set_setting_val(db, "booking_modal_animation", payload.booking_modal_animation.strip() or "golden-glow")

    return get_public_site_settings(db)

@router.post("/admin/settings/upload-asset")
async def upload_site_asset(
    file: UploadFile = File(...),
    asset_type: str = Form("logo"),
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Upload Site Logo or Favicon:
    1. Validates file format.
    2. Auto-renames according to site branding: pb08taxi-logo-{ts}.ext or pb08taxi-favicon-{ts}.ext.
    3. Uploads directly to GitHub repository under 'Logo/' folder via GitHub API.
    4. Auto-populates and persists the direct raw URL into database system settings.
    """
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    
    if asset_type == "favicon":
        allowed_exts = [".ico", ".png", ".svg", ".webp"]
        if ext not in allowed_exts and file.content_type not in ["image/x-icon", "image/vnd.microsoft.icon", "image/png", "image/svg+xml"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid favicon format. Allowed: .ico, .png, .svg"
            )
        prefix = "pb08taxi-favicon"
    elif asset_type in ("banner", "og_image", "social_banner"):
        allowed_exts = [".png", ".jpg", ".jpeg", ".webp"]
        if ext not in allowed_exts and not (file.content_type and file.content_type.startswith("image/")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid banner format. Allowed: .png, .jpg, .jpeg, .webp"
            )
        prefix = "pb08taxi-banner"
    else:
        allowed_exts = [".png", ".jpg", ".jpeg", ".webp", ".svg"]
        if ext not in allowed_exts:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid logo format. Allowed: .png, .jpg, .jpeg, .webp, .svg"
            )
        prefix = "pb08taxi-logo"

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    # Unique site-branded filename with timestamp
    ts = int(datetime.utcnow().timestamp())
    site_filename = f"{prefix}-{ts}{ext or '.png'}"
    github_path = f"Logo/{site_filename}"
    commit_msg = f"Upload {prefix} branding asset: {site_filename}"

    uploaded_url = None

    # 1. Upload directly to GitHub repository under /Logo folder
    if settings_cfg.GITHUB_TOKEN and settings_cfg.GITHUB_REPO:
        try:
            gh_headers = {
                "Authorization": f"token {settings_cfg.GITHUB_TOKEN}",
                "Accept": "application/vnd.github.v3+json"
            }
            content_b64 = base64.b64encode(file_bytes).decode("utf-8")
            gh_payload = {
                "message": commit_msg,
                "content": content_b64,
                "branch": settings_cfg.GITHUB_BRANCH
            }
            async with httpx.AsyncClient(timeout=25.0) as client:
                gh_res = await client.put(
                    f"https://api.github.com/repos/{settings_cfg.GITHUB_REPO}/contents/{github_path}",
                    headers=gh_headers,
                    json=gh_payload
                )
                if gh_res.status_code in (200, 201):
                    uploaded_url = f"https://raw.githubusercontent.com/{settings_cfg.GITHUB_REPO}/{settings_cfg.GITHUB_BRANCH}/{github_path}"
                    print(f"[UploadAsset] Successfully uploaded to GitHub: {uploaded_url}")
                else:
                    print(f"[UploadAsset] GitHub upload response status {gh_res.status_code}: {gh_res.text[:150]}")
        except Exception as ex:
            print(f"[UploadAsset] GitHub upload exception: {ex}")

    # Fallback to local upload directory if GitHub API is unreachable
    dest_path = os.path.join(UPLOAD_DIR, site_filename)
    try:
        with open(dest_path, "wb") as buffer:
            buffer.write(file_bytes)
    except Exception:
        pass

    # Save to local Logo directory as well
    try:
        repo_logo_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "Logo")
        os.makedirs(repo_logo_dir, exist_ok=True)
        with open(os.path.join(repo_logo_dir, site_filename), "wb") as f_local:
            f_local.write(file_bytes)
    except Exception:
        pass

    if not uploaded_url:
        uploaded_url = f"/uploads/{site_filename}"

    # Auto-save setting to system_settings in database
    if asset_type == "favicon":
        _set_setting_val(db, "site_favicon_url", uploaded_url)
    elif asset_type in ("banner", "og_image", "social_banner"):
        _set_setting_val(db, "seo_og_image", uploaded_url)
    else:
        _set_setting_val(db, "site_logo_url", uploaded_url)

    return {
        "url": uploaded_url,
        "filename": site_filename,
        "github_path": github_path,
        "asset_type": asset_type
    }


@router.post("/admin/settings/credentials")
def update_admin_credentials(
    payload: AdminCredentialsUpdate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update Admin ID / Username and Password with current password verification."""
    # 1. Verify current password
    if not verify_password(payload.current_password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect."
        )

    # 2. Update username if requested
    new_token = None
    if payload.new_username and payload.new_username.strip():
        new_user = payload.new_username.strip()
        if new_user != admin.username:
            existing = db.query(AdminUser).filter(AdminUser.username == new_user).first()
            if existing and existing.id != admin.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This username is already taken. Please choose another."
                )
            admin.username = new_user

    # 3. Update password if requested
    if payload.new_password and payload.new_password.strip():
        if len(payload.new_password.strip()) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be at least 6 characters long."
            )
        admin.hashed_password = hash_password(payload.new_password.strip())

    db.commit()
    db.refresh(admin)

    # Generate updated token
    new_token = create_access_token(data={"sub": admin.username, "role": "admin"})

    return {
        "message": "Admin credentials updated successfully!",
        "username": admin.username,
        "access_token": new_token
    }

DEFAULT_SAMPLE_SLIDES = [
    {
        "title": "PB08 TAXI — 24/7 Premium Cabs in Punjab",
        "subtitle": "Reliable, Safe & Air-Conditioned Rides at Affordable Fixed Rates",
        "image_url": "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1600&q=80",
        "sort_order": 1,
        "is_active": True,
    },
    {
        "title": "Airport Pickups & Outstation Journeys",
        "subtitle": "Direct transfers to Amritsar, Chandigarh & Delhi Airports with On-Time Guarantee",
        "image_url": "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?auto=format&fit=crop&w=1600&q=80",
        "sort_order": 2,
        "is_active": True,
    },
    {
        "title": "Verified Drivers & Sanitized Fleet",
        "subtitle": "Instant WhatsApp Confirmation & Dedicated Customer Support",
        "image_url": "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1600&q=80",
        "sort_order": 3,
        "is_active": True,
    },
]

@router.post("/admin/settings/factory-reset")
def factory_reset_system(
    payload: FactoryResetRequest,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Factory Reset: Wipes all operational transactional data (bookings, customers, drivers, message logs, marketing consents)
    and restores slider images, message templates, and site settings to a clean default state.
    Strictly protected with Secret PIN 333725.
    Admin user account and active WhatsApp connection session are safely preserved.
    """
    if payload.secret_pin.strip() != "333725":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Secret PIN. Factory Reset aborted."
        )

    try:
        # 1. Clear Bookings
        db.query(Booking).delete(synchronize_session=False)

        # 2. Clear WhatsApp message logs
        db.query(WhatsAppMessage).delete(synchronize_session=False)

        # 3. Clear Marketing Consents
        db.query(MarketingConsent).delete(synchronize_session=False)

        # 4. Clear Customers
        db.query(Customer).delete(synchronize_session=False)

        # 5. Clear Drivers
        db.query(Driver).delete(synchronize_session=False)

        # 6. Reset Slider Images to fresh initial defaults
        db.query(SliderImage).delete(synchronize_session=False)
        for s in DEFAULT_SAMPLE_SLIDES:
            db.add(SliderImage(
                title=s["title"],
                subtitle=s["subtitle"],
                image_url=s["image_url"],
                sort_order=s["sort_order"],
                is_active=s["is_active"]
            ))

        # 7. Reset Message Templates to fresh defaults
        db.query(MessageTemplate).delete(synchronize_session=False)
        from app.routers.admin_whatsapp import DEFAULT_TEMPLATES
        for t in DEFAULT_TEMPLATES:
            db.add(MessageTemplate(
                template_key=t["template_key"],
                title=t["title"],
                content=t["content"],
                variables_hint=t.get("variables_hint"),
                updated_at=datetime.utcnow()
            ))

        # 8. Reset Site Settings (preserve openwa_session_id so connection is not lost)
        openwa_sess_item = db.query(SystemSetting).filter(SystemSetting.key == "openwa_session_id").first()
        saved_session_id = openwa_sess_item.value if openwa_sess_item else None

        db.query(SystemSetting).delete(synchronize_session=False)

        # Restore defaults
        db.add(SystemSetting(key="support_phone", value="+919876543210", updated_at=datetime.utcnow()))
        db.add(SystemSetting(key="whatsapp_number", value="+919876543210", updated_at=datetime.utcnow()))
        db.add(SystemSetting(key="site_logo_url", value="", updated_at=datetime.utcnow()))
        db.add(SystemSetting(key="site_favicon_url", value="", updated_at=datetime.utcnow()))
        db.add(SystemSetting(key="show_credentials_hint", value="false", updated_at=datetime.utcnow()))
        db.add(SystemSetting(key="admin_alert_whatsapp_enabled", value="true", updated_at=datetime.utcnow()))
        db.add(SystemSetting(key="admin_alert_whatsapp_number", value="", updated_at=datetime.utcnow()))
        db.add(SystemSetting(key="booking_modal_animation", value="golden-glow", updated_at=datetime.utcnow()))

        if saved_session_id:
            db.add(SystemSetting(key="openwa_session_id", value=saved_session_id, updated_at=datetime.utcnow()))

        db.commit()

        return {
            "success": True,
            "message": "Website factory reset successfully! All operational records have been wiped and settings restored to clean default state."
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Factory reset failed: {str(e)}"
        )

