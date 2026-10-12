import os
import base64
import httpx
from typing import Dict, Any, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AdminUser, SystemSetting
from app.schemas import SEOSettingsOut, SEOSettingsUpdate
from app.security import get_current_admin
from app.config import get_settings

settings_cfg = get_settings()

router = APIRouter(tags=["Advance SEO"])

DEFAULT_OG_BANNER_URL = "https://raw.githubusercontent.com/pb08taxi/PB08TAXI/main/Logo/pb08taxi-banner-default.png"

SEO_DEFAULTS = {
    "seo_meta_title": "PB08 TAXI — One Click Book Your Ride | 24/7 Cab Service",
    "seo_meta_description": "PB08 TAXI provides fast, reliable, 24/7 taxi booking in Jalandhar, Punjab, and airport transfers. One click instant booking with live WhatsApp confirmation.",
    "seo_meta_keywords": "PB08 TAXI, Jalandhar Taxi, Punjab Cab Service, Airport Taxi, Outstation Cab, Amritsar Airport Cab, Delhi Airport Transfer, Jalandhar Cab Service, Best Taxi in Punjab",
    "seo_canonical_url": "https://www.pb08taxi.com",
    "seo_robots_directive": "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    
    "seo_og_title": "PB08 TAXI — 24/7 Cab Service in Punjab | One Click Booking",
    "seo_og_description": "Reliable & affordable cabs in Jalandhar, Amritsar, Ludhiana, Chandigarh & Delhi Airport. One-click reservation with instant WhatsApp confirmation.",
    "seo_og_image": DEFAULT_OG_BANNER_URL,
    "seo_twitter_card": "summary_large_image",
    
    "seo_business_name": "PB08 TAXI",
    "seo_geo_region": "IN-PB",
    "seo_geo_placename": "Jalandhar, Punjab, India",
    "seo_geo_latitude": "31.3260",
    "seo_geo_longitude": "75.5762",
    "seo_service_areas": "Jalandhar, Amritsar, Ludhiana, Chandigarh, Delhi Airport (DEL), Amritsar Airport (ATQ), Phagwara, Kapurthala, Hoshiarpur, Punjab",
    
    "seo_google_site_verification": "BAxc5FdmVweV91Jq3JdbrHI6RwWAcGTfNTjh6Dc7ch0",
    "seo_google_analytics_id": "",
    "seo_meta_pixel_id": "",
    "seo_schema_price_range": "₹₹",
    "seo_custom_head_code": ""
}

def _get_val(db: Session, key: str, default: str) -> str:
    item = db.query(SystemSetting).filter(SystemSetting.key == key).first()
    if item and item.value is not None:
        return item.value
    return default

def _set_val(db: Session, key: str, val: Optional[str]):
    item = db.query(SystemSetting).filter(SystemSetting.key == key).first()
    clean_val = val.strip() if val is not None else ""
    if not item:
        item = SystemSetting(key=key, value=clean_val, updated_at=datetime.utcnow())
        db.add(item)
    else:
        item.value = clean_val
        item.updated_at = datetime.utcnow()
    db.commit()

def build_seo_response(db: Session) -> SEOSettingsOut:
    return SEOSettingsOut(
        meta_title=_get_val(db, "seo_meta_title", SEO_DEFAULTS["seo_meta_title"]),
        meta_description=_get_val(db, "seo_meta_description", SEO_DEFAULTS["seo_meta_description"]),
        meta_keywords=_get_val(db, "seo_meta_keywords", SEO_DEFAULTS["seo_meta_keywords"]),
        canonical_url=_get_val(db, "seo_canonical_url", SEO_DEFAULTS["seo_canonical_url"]),
        robots_directive=_get_val(db, "seo_robots_directive", SEO_DEFAULTS["seo_robots_directive"]),
        
        og_title=_get_val(db, "seo_og_title", SEO_DEFAULTS["seo_og_title"]),
        og_description=_get_val(db, "seo_og_description", SEO_DEFAULTS["seo_og_description"]),
        og_image=_get_val(db, "seo_og_image", SEO_DEFAULTS["seo_og_image"]),
        twitter_card=_get_val(db, "seo_twitter_card", SEO_DEFAULTS["seo_twitter_card"]),
        
        business_name=_get_val(db, "seo_business_name", SEO_DEFAULTS["seo_business_name"]),
        geo_region=_get_val(db, "seo_geo_region", SEO_DEFAULTS["seo_geo_region"]),
        geo_placename=_get_val(db, "seo_geo_placename", SEO_DEFAULTS["seo_geo_placename"]),
        geo_latitude=_get_val(db, "seo_geo_latitude", SEO_DEFAULTS["seo_geo_latitude"]),
        geo_longitude=_get_val(db, "seo_geo_longitude", SEO_DEFAULTS["seo_geo_longitude"]),
        service_areas=_get_val(db, "seo_service_areas", SEO_DEFAULTS["seo_service_areas"]),
        
        google_site_verification=_get_val(db, "seo_google_site_verification", "") or None,
        google_analytics_id=_get_val(db, "seo_google_analytics_id", "") or None,
        meta_pixel_id=_get_val(db, "seo_meta_pixel_id", "") or None,
        schema_taxi_price_range=_get_val(db, "seo_schema_price_range", SEO_DEFAULTS["seo_schema_price_range"]),
        custom_head_code=_get_val(db, "seo_custom_head_code", "") or None
    )

@router.get("/seo", response_model=SEOSettingsOut)
def get_public_seo_settings(db: Session = Depends(get_db)):
    """Public endpoint consumed by the frontend and indexing bots to hydrate meta tags."""
    return build_seo_response(db)

@router.get("/admin/seo", response_model=SEOSettingsOut)
def get_admin_seo_settings(
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to view current A-to-Z SEO and Omnichannel configuration."""
    return build_seo_response(db)

@router.post("/admin/seo", response_model=SEOSettingsOut)
def update_admin_seo_settings(
    payload: SEOSettingsUpdate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to update any of the SEO settings."""
    if payload.meta_title is not None:
        _set_val(db, "seo_meta_title", payload.meta_title)
    if payload.meta_description is not None:
        _set_val(db, "seo_meta_description", payload.meta_description)
    if payload.meta_keywords is not None:
        _set_val(db, "seo_meta_keywords", payload.meta_keywords)
    if payload.canonical_url is not None:
        _set_val(db, "seo_canonical_url", payload.canonical_url)
    if payload.robots_directive is not None:
        _set_val(db, "seo_robots_directive", payload.robots_directive)
        
    if payload.og_title is not None:
        _set_val(db, "seo_og_title", payload.og_title)
    if payload.og_description is not None:
        _set_val(db, "seo_og_description", payload.og_description)
    if payload.og_image is not None:
        _set_val(db, "seo_og_image", payload.og_image)
    if payload.twitter_card is not None:
        _set_val(db, "seo_twitter_card", payload.twitter_card)
        
    if payload.business_name is not None:
        _set_val(db, "seo_business_name", payload.business_name)
    if payload.geo_region is not None:
        _set_val(db, "seo_geo_region", payload.geo_region)
    if payload.geo_placename is not None:
        _set_val(db, "seo_geo_placename", payload.geo_placename)
    if payload.geo_latitude is not None:
        _set_val(db, "seo_geo_latitude", payload.geo_latitude)
    if payload.geo_longitude is not None:
        _set_val(db, "seo_geo_longitude", payload.geo_longitude)
    if payload.service_areas is not None:
        _set_val(db, "seo_service_areas", payload.service_areas)
        
    if payload.google_site_verification is not None:
        _set_val(db, "seo_google_site_verification", payload.google_site_verification)
    if payload.google_analytics_id is not None:
        _set_val(db, "seo_google_analytics_id", payload.google_analytics_id)
    if payload.meta_pixel_id is not None:
        _set_val(db, "seo_meta_pixel_id", payload.meta_pixel_id)
    if payload.schema_taxi_price_range is not None:
        _set_val(db, "seo_schema_price_range", payload.schema_taxi_price_range)
    if payload.custom_head_code is not None:
        _set_val(db, "seo_custom_head_code", payload.custom_head_code)
        
    return build_seo_response(db)

@router.post("/admin/seo/reset", response_model=SEOSettingsOut)
def reset_admin_seo_defaults(
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Reset all SEO settings back to official high-ranking PB08 TAXI defaults."""
    for key, val in SEO_DEFAULTS.items():
        _set_val(db, key, val)
    return build_seo_response(db)

@router.post("/admin/seo/upload-banner")
async def upload_seo_banner(
    file: UploadFile = File(...),
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Upload Social Sharing Preview Banner (og:image / WhatsApp & Social Card):
    1. Validates file format (.png, .jpg, .jpeg, .webp).
    2. Auto-renames to pb08taxi-banner-{ts}.ext.
    3. Uploads directly to GitHub repository under 'Logo/' folder via GitHub API.
    4. Auto-saves direct raw URL into database under 'seo_og_image'.
    """
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    allowed_exts = [".png", ".jpg", ".jpeg", ".webp"]
    if ext not in allowed_exts and not (file.content_type and file.content_type.startswith("image/")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid banner format. Allowed: .png, .jpg, .jpeg, .webp"
        )

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    ts = int(datetime.utcnow().timestamp())
    site_filename = f"pb08taxi-banner-{ts}{ext or '.png'}"
    github_path = f"Logo/{site_filename}"
    commit_msg = f"Upload pb08taxi-banner social card asset: {site_filename}"

    uploaded_url = None

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
                    print(f"[UploadBanner] Successfully uploaded to GitHub: {uploaded_url}")
                else:
                    print(f"[UploadBanner] GitHub upload response status {gh_res.status_code}: {gh_res.text[:150]}")
        except Exception as ex:
            print(f"[UploadBanner] GitHub upload exception: {ex}")

    # Fallback to local save
    try:
        repo_logo_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "Logo")
        os.makedirs(repo_logo_dir, exist_ok=True)
        with open(os.path.join(repo_logo_dir, site_filename), "wb") as f_local:
            f_local.write(file_bytes)
    except Exception:
        pass

    if not uploaded_url:
        uploaded_url = f"/uploads/{site_filename}"

    _set_val(db, "seo_og_image", uploaded_url)

    return {
        "url": uploaded_url,
        "filename": site_filename,
        "github_path": github_path
    }

