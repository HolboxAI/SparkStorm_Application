# app/schemas/reports.py
import os
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ReportBase(BaseModel):
    description: Optional[str] = None

class ReportCreate(ReportBase):
    pass

class ReportResponse(ReportBase):
    id: int
    file_path: str
    original_filename: str
    uploaded_at: datetime
    summary: Optional[str] = None
    
    class Config:
        from_attributes = True

class ChatQuery(BaseModel):
    query: str = Field(..., description="The user's question about their reports")
    
class ChatResponse(BaseModel):
    answer: str
    sources: List[dict] = []