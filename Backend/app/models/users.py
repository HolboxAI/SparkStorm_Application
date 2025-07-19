# app/models/users.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Table, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import uuid
from typing import Optional
from datetime import datetime

from app.databse import Base

class UserRole(Base):
    __tablename__ = "user_roles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    
    # Relationship
    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    clerk_id = Column(String(64), unique=True, nullable=False)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    image_url = Column(String(255), nullable=True, default="default_profile_image.png")
    hashed_password = Column(String)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    organisation_name = Column(String(100), nullable=True)
    user_uuid = Column(String, nullable=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign Keys
    role_id = Column(Integer, ForeignKey("user_roles.id"), nullable=True)
    
    # Relationships
    role = relationship("UserRole", back_populates="users")
    reports = relationship("Reports", back_populates="user")