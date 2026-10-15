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
    slider_transition_effect = _get_setting_val(db, "slider_transition_effect", "fade")
    slider_fade_duration_raw = _get_setting_val(db, "slider_fade_duration", "1000")
    slider_autoplay_interval_raw = _get_setting_val(db, "slider_autoplay_interval", "5500")
    slider_overlay_opacity_raw = _get_setting_val(db, "slider_overlay_opacity", "55")
    slider_overlay_color = _get_setting_val(db, "slider_overlay_color", "#000000")
    social_facebook = _get_setting_val(db, "social_facebook", "https://facebook.com/pb08taxi")
    social_instagram = _get_setting_val(db, "social_instagram", "https://instagram.com/pb08taxi")
    social_twitter = _get_setting_val(db, "social_twitter", "https://twitter.com/pb08taxi")
    social_youtube = _get_setting_val(db, "social_youtube", "https://youtube.com/@pb08taxi")
    try:
        slider_fade_duration = int(slider_fade_duration_raw)
    except (ValueError, TypeError):
        slider_fade_duration = 1000
    try:
        slider_autoplay_interval = int(slider_autoplay_interval_raw)
    except (ValueError, TypeError):
        slider_autoplay_interval = 5500
    try:
        slider_overlay_opacity = int(slider_overlay_opacity_raw)
    except (ValueError, TypeError):
        slider_overlay_opacity = 55

    return SiteSettingsOut(
        support_phone=support_phone,
        whatsapp_number=whatsapp_number,
        site_logo_url=site_logo_url or None,
        site_favicon_url=site_favicon_url or None,
        site_logo_size=site_logo_size,
        brand_title=brand_title or "PB08 TAXI",
        brand_tagline=brand_tagline or "Fast • Safe • Reliable",
        show_credentials_hint=show_credentials_hint,
        booking_modal_animation=booking_modal_animation or "golden-glow",
        slider_transition_effect=slider_transition_effect or "fade",
        slider_fade_duration=slider_fade_duration,
        slider_autoplay_interval=slider_autoplay_interval,
        slider_overlay_opacity=slider_overlay_opacity,
        slider_overlay_color=slider_overlay_color or "#000000",
        social_facebook=social_facebook,
        social_instagram=social_instagram,
        social_twitter=social_twitter,
        social_youtube=social_youtube
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
    """Admin endpoint to update phone numbers, logo/favicon URLs, brand texts, login hint display, booking modal animation, and slider transitions."""
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

    if payload.slider_transition_effect is not None:
        _set_setting_val(db, "slider_transition_effect", payload.slider_transition_effect.strip() or "fade")

    if payload.slider_fade_duration is not None:
        bounded_fade = max(200, min(5000, payload.slider_fade_duration))
        _set_setting_val(db, "slider_fade_duration", str(bounded_fade))

    if payload.slider_autoplay_interval is not None:
        bounded_interval = max(2000, min(15000, payload.slider_autoplay_interval))
        _set_setting_val(db, "slider_autoplay_interval", str(bounded_interval))

    if payload.slider_overlay_opacity is not None:
        bounded_opacity = max(0, min(100, payload.slider_overlay_opacity))
        _set_setting_val(db, "slider_overlay_opacity", str(bounded_opacity))

    if payload.slider_overlay_color is not None:
        clean_color = payload.slider_overlay_color.strip() or "#000000"
        _set_setting_val(db, "slider_overlay_color", clean_color)

    if payload.social_facebook is not None:
        _set_setting_val(db, "social_facebook", payload.social_facebook.strip())

    if payload.social_instagram is not None:
        _set_setting_val(db, "social_instagram", payload.social_instagram.strip())

    if payload.social_twitter is not None:
        _set_setting_val(db, "social_twitter", payload.social_twitter.strip())

    if payload.social_youtube is not None:
        _set_setting_val(db, "social_youtube", payload.social_youtube.strip())

    return get_public_site_settings(db)

from app.utils.image_converter import convert_to_webp

@router.post("/admin/settings/upload-asset")
async def upload_site_asset(
    file: UploadFile = File(...),
    asset_type: str = Form("logo"),
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Upload Site Logo or Favicon:
    1. Accepts any image format (PNG, JPG, JPEG, GIF, WEBP, BMP, SVG, ICO).
    2. Automatically converts raster images into modern, ultra-lightweight WebP format.
    3. Auto-renames according to site branding: pb08taxi-logo-{ts}.webp or pb08taxi-favicon-{ts}.webp.
    4. Uploads directly to GitHub repository under 'Logo/' folder via GitHub API.
    5. Auto-populates and persists the direct raw URL into database system settings.
    """
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    
    if asset_type == "favicon":
        prefix = "pb08taxi-favicon"
    elif asset_type in ("banner", "og_image", "social_banner"):
        prefix = "pb08taxi-banner"
    else:
        prefix = "pb08taxi-logo"

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    # Automatically convert any raster format (PNG, JPG, JPEG, GIF, BMP, TIFF) to WebP
    if ext != ".svg" and (asset_type != "favicon" or ext != ".ico"):
        max_dim = 800 if asset_type == "logo" else (256 if asset_type == "favicon" else 1920)
        file_bytes, _, _ = convert_to_webp(
            file_bytes=file_bytes,
            original_filename=file.filename or "asset.png",
            max_dimension=max_dim,
            quality=88
        )
        ext = ".webp"

    # Unique site-branded filename with timestamp
    ts = int(datetime.utcnow().timestamp())
    site_filename = f"{prefix}-{ts}{ext or '.webp'}"
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
    Selective or Full Factory Reset:
    Admin has 100% granular control with checkboxes to pick and choose exactly what to erase.
    Strictly protected with Secret PIN 333725.
    Admin user account and active WhatsApp connection session are safely preserved.
    """
    if payload.secret_pin.strip() != "333725":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Secret PIN. Factory Reset aborted."
        )

    all_flags = [
        payload.clear_bookings,
        payload.clear_customers,
        payload.clear_drivers,
        payload.clear_whatsapp_logs,
        payload.clear_marketing_consents,
        payload.reset_slider_images,
        payload.reset_message_templates,
        payload.reset_site_settings,
    ]
    # If no specific flags passed, wipe all for backward compatibility
    wipe_all = not any(all_flags)

    cleared_items = []

    try:
        # 1. Clear Bookings (also auto-triggered if clearing customers due to FK cascade)
        if payload.clear_bookings or wipe_all or payload.clear_customers:
            b_count = db.query(Booking).delete(synchronize_session=False)
            cleared_items.append(f"{b_count} Bookings")

        # 2. Clear WhatsApp message logs
        if payload.clear_whatsapp_logs or wipe_all:
            w_count = db.query(WhatsAppMessage).delete(synchronize_session=False)
            cleared_items.append(f"{w_count} WhatsApp Logs")

        # 3. Clear Marketing Consents
        if payload.clear_marketing_consents or wipe_all:
            m_count = db.query(MarketingConsent).delete(synchronize_session=False)
            cleared_items.append(f"{m_count} Marketing Consents")

        # 4. Clear Customers
        if payload.clear_customers or wipe_all:
            c_count = db.query(Customer).delete(synchronize_session=False)
            cleared_items.append(f"{c_count} Customers")

        # 5. Clear Drivers
        if payload.clear_drivers or wipe_all:
            d_count = db.query(Driver).delete(synchronize_session=False)
            cleared_items.append(f"{d_count} Drivers")

        # 6. Reset Slider Images to fresh initial defaults
        if payload.reset_slider_images or wipe_all:
            db.query(SliderImage).delete(synchronize_session=False)
            for s in DEFAULT_SAMPLE_SLIDES:
                db.add(SliderImage(
                    title=s["title"],
                    subtitle=s["subtitle"],
                    image_url=s["image_url"],
                    sort_order=s["sort_order"],
                    is_active=s["is_active"]
                ))
            cleared_items.append("Slider Images restored to defaults")

        # 7. Reset Message Templates to fresh defaults
        if payload.reset_message_templates or wipe_all:
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
            cleared_items.append("WhatsApp Templates restored to defaults")

        # 8. Reset Site Settings (preserve openwa_session_id so connection is not lost)
        if payload.reset_site_settings or wipe_all:
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

            cleared_items.append("Site Settings restored to defaults")

        db.commit()

        summary_text = ", ".join(cleared_items) if cleared_items else "No items selected."
        return {
            "success": True,
            "message": f"Factory reset completed successfully! ({summary_text})",
            "cleared_items": cleared_items
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Factory reset failed: {str(e)}"
        )

