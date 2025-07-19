# app/routers/users.py
import base64
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Body, Form, UploadFile, File
import httpx
from sqlalchemy.orm import Session
from typing import List
import uuid
import traceback
import os
from ..models.users import User, UserRole
from ..schemas.users import UserCreate, UserResponse, UserUpdate, ResetPassword
from ..databse import get_db
from ..core.auth import get_current_user

router = APIRouter()

# Replace with your Clerk JWT verification logic
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL")
CLERK_API_KEY = os.getenv("CLERK_API_KEY")
CLERK_SECRET_KEY= os.getenv("CLERK_SECRET_KEY")

@router.post("/create", response_model=dict)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            return {"success": 0, "message": "Email already exists"}
        
        # Get role
        role = db.query(UserRole).filter(UserRole.name == user_data.role).first()
        if not role:
            return {"success": 0, "message": "Role not found"}
        
        # Create user
        # hashed_password = get_password_hash(user_data.password)
        new_user = User(
            email=user_data.email,
            username=user_data.email,
            # hashed_password=hashed_password,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            is_active=user_data.is_active,
            user_uuid=str(uuid.uuid4())
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return {"success": True, "message": "User created successfully"}
    except Exception as e:
        print(traceback.format_exc())
        return {"success": False, "message": "User creation failed"}

@router.post("/edit", response_model=dict)
async def edit_user(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Check if ID exists
        if not user_data.id:
            return {"success": 0, "message": "ID not provided"}
        
        # Check if email already exists for another user
        existing_user = db.query(User).filter(
            User.email == user_data.email, 
            User.id != user_data.id
        ).first()
        
        if existing_user:
            return {"success": 0, "message": "Email already exists"}
        
        # Check if user exists
        user = db.query(User).filter(User.id == user_data.id).first()
        if not user:
            return {"success": 0, "message": "User not found"}
        
        # Get role
        role = db.query(UserRole).filter(UserRole.name == user_data.role).first()
        if not role:
            return {"success": 0, "message": "Role not found"}
        
        # Update user
        user.username = user_data.email
        user.email = user_data.email
        user.first_name = user_data.first_name
        user.last_name = user_data.last_name
        user.organisation_name = user_data.organisation_name
        user.role_id = role.id
        user.is_active = user_data.is_active
        
        db.commit()
        
        return {"success": True, "message": "User updated successfully"}
    except Exception as e:
        print(traceback.format_exc())
        return {"success": False, "message": "User update failed"}

@router.post("/delete", response_model=dict)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Check if user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"success": 0, "message": "User not found"}
        
        # Delete user
        db.delete(user)
        db.commit()
        
        return {"success": True, "message": "User deleted successfully"}
    except Exception as e:
        return {"success": False, "message": "User deletion failed"}

@router.get("/list", response_model=List[UserResponse])
async def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        users = db.query(User).all()
        return [
            UserResponse(
                id=user.id,
                email=user.email,
                first_name=user.first_name,
                last_name=user.last_name,
                organisation_name=user.organisation_name,
                is_active=user.is_active,
                role=user.role.name if user.role else None
            )
            for user in users
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something went wrong"
        )

@router.get("/details/{user_id}", response_model=UserResponse)
async def get_user_details(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            organisation_name=user.organisation_name,
            is_active=user.is_active,
            role=user.role.name if user.role else None
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something went wrong"
        )

@router.post("/reset_password", response_model=dict)
async def reset_password(
    reset_data: ResetPassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Check if passwords match
        if reset_data.formdata["current_password"] != reset_data.formdata["confirm_current_password"]:
            return {
                "responseCode": 0,
                "responseMessage": "Current password and confirm current password do not match"
            }
        
        # Get user
        user = db.query(User).filter(User.id == reset_data.id).first()
        if not user:
            return {
                "responseCode": 0,
                "responseMessage": "User not found"
            }
        
        # Update password
        user.hashed_password = get_password_hash(reset_data.formdata["current_password"])
        db.commit()
        
        return {"success": True, "message": "Password updated successfully"}
    except Exception as e:
        return {
            "responseCode": 0,
            "responseMessage": "Something went wrong"
        }
    
@router.patch("/update_profile", response_model=dict)
async def update_profile(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Authorization check:
        if user_data.id != current_user.id:
            # Optional: check if current_user has admin role
            if not current_user.is_superuser:  # Assuming ID 1 is admin
                return {"success": 0, "message": "Not authorized to update this user"}

        user = db.query(User).filter(User.id == user_data.id).first()
        if not user:
            return {"success": 0, "message": "User not found"}

        if user_data.email and user_data.email != user.email:
            existing_user = db.query(User).filter(
                User.email == user_data.email,
                User.id != user_data.id
            ).first()
            if existing_user:
                return {"success": 0, "message": "Email already exists"}
            user.email = user_data.email
            user.username = user_data.email

        if user_data.role:
            role = db.query(UserRole).filter(UserRole.name == user_data.role).first()
            if not role:
                return {"success": 0, "message": "Role not found"}
            user.role_id = role.id

        if user_data.first_name is not None:
            user.first_name = user_data.first_name
        if user_data.last_name is not None:
            user.last_name = user_data.last_name
        if user_data.organisation_name is not None:
            user.organisation_name = user_data.organisation_name
        if user_data.is_active is not None:
            user.is_active = user_data.is_active

        db.commit()
        return {"success": True, "message": "User updated successfully"}

    except Exception:
        print(traceback.format_exc())
        return {"success": False, "message": "User update failed"}
    

@router.post("/edit-image", response_model=dict)
async def edit_user_image(
    id: int = Form(...),  # user id as form field
    image: UploadFile = File(...),  # uploaded image file
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Check if the current user is updating their own image
        if current_user.id != id and not current_user.is_superuser:
            return {
                "success": 0,
                "message": "Not authorized to update image of other users"
            }


        user = db.query(User).filter(User.id == id).first()
        if not user:
            return {"success": 0, "message": "User not found"}

        # Save the uploaded image as before
        UPLOAD_DIR = "static/uploads"
        import os
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        import uuid
        file_ext = os.path.splitext(image.filename)[1]
        unique_filename = f"{uuid.uuid4().hex}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        contents = await image.read()
        with open(file_path, "wb") as f:
            f.write(contents)

        user.image_url = f"uploads/{unique_filename}"
        db.commit()

        return {"success": True, "message": "User image updated successfully"}

    except Exception:
        import traceback
        traceback.print_exc()
        return {"success": False, "message": "User image update failed"}
