import os
import uuid
import shutil
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AdminUser, SliderImage
from app.schemas import SliderImageCreate, SliderImageUpdate, SliderImageOut
from app.security import get_current_admin

router = APIRouter(prefix="/admin/slider-images", tags=["Admin Slider"])

# Directory for file uploads
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("", response_model=List[SliderImageOut])
def get_all_slider_images(
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all slider images for admin management."""
    return db.query(SliderImage).order_by(SliderImage.sort_order.asc(), SliderImage.id.asc()).all()

@router.post("", response_model=SliderImageOut, status_code=status.HTTP_201_CREATED)
def create_slider_image(
    payload: SliderImageCreate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Add a new homepage slider image."""
    slide = SliderImage(
        title=payload.title,
        subtitle=payload.subtitle,
        image_url=payload.image_url,
        sort_order=payload.sort_order,
        is_active=payload.is_active,
        created_at=datetime.utcnow()
    )
    db.add(slide)
    db.commit()
    db.refresh(slide)
    return slide

@router.put("/{slide_id}", response_model=SliderImageOut)
def update_slider_image(
    slide_id: int,
    payload: SliderImageUpdate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update slide title, subtitle, image_url, sort_order, or active status."""
    slide = db.query(SliderImage).filter(SliderImage.id == slide_id).first()
    if not slide:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Slide not found")

    if payload.title is not None:
        slide.title = payload.title
    if payload.subtitle is not None:
        slide.subtitle = payload.subtitle
    if payload.image_url is not None:
        slide.image_url = payload.image_url
    if payload.sort_order is not None:
        slide.sort_order = payload.sort_order
    if payload.is_active is not None:
        slide.is_active = payload.is_active

    db.commit()
    db.refresh(slide)
    return slide

@router.delete("/{slide_id}", status_code=status.HTTP_200_OK)
def delete_slider_image(
    slide_id: int,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a slider image."""
    slide = db.query(SliderImage).filter(SliderImage.id == slide_id).first()
    if not slide:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Slide not found")

    db.delete(slide)
    db.commit()
    return {"message": "Slide deleted successfully", "id": slide_id}

@router.post("/upload")
async def upload_slide_image(
    file: UploadFile = File(...),
    admin: AdminUser = Depends(get_current_admin)
):
    """Upload an image file and return its accessible URL."""
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type {file.content_type}. Allowed: JPEG, PNG, WEBP."
        )

    # Secure unique filename
    ext = os.path.splitext(file.filename)[1].lower() or ".jpg"
    safe_name = f"slide_{uuid.uuid4().hex[:12]}{ext}"
    dest_path = os.path.join(UPLOAD_DIR, safe_name)

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "url": f"/uploads/{safe_name}",
        "filename": safe_name
    }
