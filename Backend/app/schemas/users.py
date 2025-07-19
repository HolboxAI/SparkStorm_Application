# app/schemas/users.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserRoleBase(BaseModel):
    name: str

class UserRoleCreate(UserRoleBase):
    pass

class UserRoleResponse(UserRoleBase):
    id: int
    
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    organisation_name: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str
    role: str  # Role name

class UserUpdate(BaseModel):
    id: int
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    organisation_name: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None

class UserImageUpdate(BaseModel):
    id: int  # user id whose image will be updated

class UserResponse(UserBase):
    id: int
    role: str  # Role name
    
    class Config:
        from_attributes = True

class ResetPassword(BaseModel):
    id: int
    formdata: dict = Field(..., example={
        "current_password": "newpassword",
        "confirm_current_password": "newpassword"
    })

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str
    first_name: Optional[str] = None
    organisation_name: Optional[str] = None
    role: str