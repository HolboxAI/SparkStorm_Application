# app/models/reports.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import List, Optional

from app.databse import Base

class Reports(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    file_path = Column(String)
    original_filename = Column(String)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    description = Column(String(255), nullable=True)
    extracted_text = Column(Text)
    summary = Column(Text, nullable=True)
    text_vector = Column(ARRAY(Float), nullable=True)
    
    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    user = relationship("User", back_populates="reports") 