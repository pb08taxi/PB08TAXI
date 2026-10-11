from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AdminUser
from app.schemas import AdminLogin, Token
from app.security import verify_password, create_access_token, get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin Auth"])

@router.post("/login", response_model=Token)
def login_admin(payload: AdminLogin, db: Session = Depends(get_db)):
    """Authenticate administrator and return JWT token."""
    admin = db.query(AdminUser).filter(AdminUser.username == payload.username.strip()).first()
    if not admin or not verify_password(payload.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": admin.username, "role": "admin"})
    return Token(access_token=access_token, token_type="bearer", username=admin.username, role="admin")

@router.get("/me")
def get_current_admin_info(admin: AdminUser = Depends(get_current_admin)):
    """Verify admin session and return profile info."""
    return {
        "id": admin.id,
        "username": admin.username,
        "email": admin.email,
        "created_at": admin.created_at
    }
