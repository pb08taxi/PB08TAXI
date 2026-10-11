import os
import uuid
import shutil
from typing import Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AdminUser, SystemSetting
from app.schemas import SiteSettingsOut, SiteSettingsUpdate, AdminCredentialsUpdate
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
    """Public endpoint to fetch current contact info, logo, favicon, and login hint config."""
    support_phone = _get_setting_val(db, "support_phone", settings_cfg.SUPPORT_PHONE)
    whatsapp_number = _get_setting_val(db, "whatsapp_number", settings_cfg.SUPPORT_WHATSAPP)
    site_logo_url = _get_setting_val(db, "site_logo_url", "")
    site_favicon_url = _get_setting_val(db, "site_favicon_url", "")
    show_hint_str = _get_setting_val(db, "show_credentials_hint", "false").lower()
    show_credentials_hint = show_hint_str in ("true", "1", "yes")

    return SiteSettingsOut(
        support_phone=support_phone,
        whatsapp_number=whatsapp_number,
        site_logo_url=site_logo_url or None,
        site_favicon_url=site_favicon_url or None,
        show_credentials_hint=show_credentials_hint
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
    """Admin endpoint to update phone numbers, logo/favicon URLs, and login hint display."""
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
        
    if payload.show_credentials_hint is not None:
        _set_setting_val(db, "show_credentials_hint", "true" if payload.show_credentials_hint else "false")

    return get_public_site_settings(db)

@router.post("/admin/settings/upload-asset")
async def upload_site_asset(
    file: UploadFile = File(...),
    asset_type: str = Form("logo"),
    admin: AdminUser = Depends(get_current_admin)
):
    """Upload Site Logo or Favicon with file type validation."""
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    
    if asset_type == "favicon":
        allowed_exts = [".ico", ".png", ".svg", ".webp"]
        if ext not in allowed_exts and file.content_type not in ["image/x-icon", "image/vnd.microsoft.icon", "image/png", "image/svg+xml"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid favicon format. Allowed: .ico, .png, .svg"
            )
        prefix = "favicon_"
    else:
        allowed_exts = [".png", ".jpg", ".jpeg", ".webp", ".svg"]
        if ext not in allowed_exts:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid logo format. Allowed: .png, .jpg, .jpeg, .webp, .svg"
            )
        prefix = "logo_"

    safe_name = f"{prefix}{uuid.uuid4().hex[:10]}{ext or '.png'}"
    dest_path = os.path.join(UPLOAD_DIR, safe_name)

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "url": f"/uploads/{safe_name}",
        "filename": safe_name,
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
