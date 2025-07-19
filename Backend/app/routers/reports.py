# app/routers/reports.py
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, status
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
import uuid
from datetime import datetime

from ..models.users import User
from ..models.reports import Reports
from ..schemas.reports import ReportResponse
from ..databse import get_db
from ..core.auth import get_current_user
# from ..services.azure_ocr import AzureOcrHelper
from ..services.textract_helper import TextractHelper
from ..services.document_store import DocumentStore
from ..config import settings

router = APIRouter()

@router.post("/upload", response_model=dict)
async def upload_file(
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Lazy initialization with error handling
        try:
            # ocr_helper = AzureOcrHelper()
            ocr_helper = TextractHelper()
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="OCR service is not properly configured. Please contact an administrator."
            )
        
        # Create user directory if it doesn't exist
        user_dir = os.path.join(settings.UPLOAD_DIRECTORY, str(current_user.clerk_id))
        os.makedirs(user_dir, exist_ok=True)
        
        # Create temp directory if it doesn't exist
        temp_dir = os.path.join(settings.TEMP_DIRECTORY)
        os.makedirs(temp_dir, exist_ok=True)
        
        # Generate a unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Save the file temporarily for OCR processing
        temp_file_path = os.path.join(temp_dir, unique_filename)
        with open(temp_file_path, "wb") as temp_file:
            shutil.copyfileobj(file.file, temp_file)
        
        # Extract text using Azure OCR
        try:
            extracted_text = ocr_helper.extract_text_from_pdf(temp_file_path)
            print(f"Extracted text: {extracted_text}")
        except Exception as e:
            # Clean up temp file
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"OCR processing failed: {str(e)}"
            )
        
        # Save the file to the user's directory
        file_path = os.path.join(user_dir, unique_filename)
        shutil.move(temp_file_path, file_path)
        
        # Create metadata for document store
        metadata = {
            "filename": file.filename,
            "description": description or "",
            "upload_date": datetime.now().isoformat(),
            "report_type": "pdf"
        }
        
        # Store document in vector database
        try:
            document_store = DocumentStore()
            vector_store = document_store.store_document(
                current_user.clerk_id,
                file.filename,
                extracted_text,
                metadata,
                str(current_user.id)
            )
            document_store.persist_all()
            print("vector store", vector_store)
        except Exception as e:
            print(f"Error storing document vectors: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to store document vectors: {str(e)}"
            )
        
        # Save report to database
        report = Reports(
            file_path=file_path,
            original_filename=file.filename,
            description=description,
            extracted_text=extracted_text,
            user_id=current_user.id
        )
        
        db.add(report)
        db.commit()
        db.refresh(report)
        
        return {
            "success": True,
            "message": "File uploaded and processed successfully",
            "extracted_text": extracted_text,
            "report_id": report.id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        # Clean up any temporary files
        print(f"Error during file upload: {str(e)}")
        temp_file_path = os.path.join(temp_dir, unique_filename) if 'unique_filename' in locals() else None
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"File upload failed: {str(e)}"
        )

@router.get("/files", response_model=List[ReportResponse])
async def list_files(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        reports = db.query(Reports).filter(Reports.user_id == current_user.id).order_by(Reports.uploaded_at.desc()).all()
        return reports
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve files: {str(e)}"
        )

@router.get("/files/{report_id}", response_model=ReportResponse)
async def get_file_details(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        report = db.query(Reports).filter(
            Reports.id == report_id,
            Reports.user_id == current_user.id
        ).first()
        
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found"
            )
        
        return report
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve file details: {str(e)}"
        )
    
@router.delete("/files/{report_id}", response_model=dict)
async def delete_file(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Find the report by ID for the current user
        report = db.query(Reports).filter(
            Reports.id == report_id,
            Reports.user_id == current_user.id  # Use the current user's ID
        ).first()
        print(f"Deleting report with ID: {report_id} for user: {current_user.id}")
        # Check if the report exists
        
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found"
            )

        # Remove the file from the filesystem
        if os.path.exists(report.file_path):
            os.remove(report.file_path)

        # Remove from the document store using the current_user.id
        document_store = DocumentStore()
        document_store.delete_document(report_id=report.id, user_id=current_user.clerk_id)  # Pass user_id dynamically
        
        # Delete the record from the database
        db.delete(report)
        db.commit()

        return {
            "success": True,
            "message": "Report deleted successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete file: {str(e)}"
        )
    

@router.get("/files/{report_id}/download")
async def download_file(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Find the report by ID for the current user
        report = db.query(Reports).filter(
            Reports.id == report_id,
            Reports.user_id == current_user.id  # Ensure the file belongs to the current user
        ).first()
        
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found"
            )

        # Get the file path from the report
        file_path = report.file_path

        # Check if the file exists
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found on the server"
            )

        # Serve the file as a download response
        return FileResponse(file_path, media_type='application/octet-stream', filename=os.path.basename(file_path))

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to download file: {str(e)}"
        )