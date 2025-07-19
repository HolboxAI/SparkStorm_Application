# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from ..models.users import User, UserRole
from ..schemas.users import TokenResponse
from ..databse import get_db
# from ..core.auth import verify_password, create_access_token, get_password_hash
from ..config import settings

router = APIRouter()

@router.post("/token", response_model=TokenResponse)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # --- Start Debug Logging ---
    print(f"Attempting login for username: '{form_data.username}'")
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user:
        print(f"User '{form_data.username}' not found in database.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password", # Keep generic for security
            headers={"WWW-Authenticate": "Bearer"},
        )

    print(f"User found: ID={user.id}, Email='{user.email}'")
    print(f"Password from form: '{form_data.password}' (Length: {len(form_data.password)})")
    print(f"Hash from DB: '{user.hashed_password}' (Length: {len(user.hashed_password)})")

    password_match = verify_password(form_data.password, user.hashed_password)
    print(f"Result of verify_password: {password_match}")
    # --- End Debug Logging ---

    # Original verification logic
    if not password_match:
        print("Password verification failed.") # Added log
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token with user ID as subject
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    
    # Get user role
    role_name = user.role.name if user.role else "user"
    
    print("Login successful, returning token.") # Added log
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "first_name": user.first_name,
        "organisation_name": user.organisation_name,
        "role": role_name
    }