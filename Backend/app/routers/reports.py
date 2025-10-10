# app/routers/reports.py
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
import uuid
from datetime import datetime
import boto3
from botocore.client import Config as BotoConfig
from botocore.exceptions import BotoCoreError, ClientError

from ..models.users import User
from ..models.reports import Reports
from ..schemas.reports import ReportResponse
from ..databse import get_db
from ..core.auth import get_current_user
from ..services.textract_helper import TextractHelper
from ..services.document_store import DocumentStore
from ..config import settings

router = APIRouter()

def _s3():
    # Check if AWS credentials are configured
    if not (hasattr(settings, 'AWS_ACCESS_KEY_ID') and settings.AWS_ACCESS_KEY_ID and
            hasattr(settings, 'AWS_SECRET_ACCESS_KEY') and settings.AWS_SECRET_ACCESS_KEY):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AWS credentials are not configured"
        )
    
    return boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=getattr(settings, "AWS_REGION", "us-east-1"),
        config=BotoConfig(signature_version="s3v4")
    )

def _to_s3_uri(bucket: str, key: str) -> str:
    return f"s3://{bucket}/{key}"

def _from_s3_uri(uri: str) -> tuple[str, str]:
    if not uri.startswith("s3://"):
        raise ValueError("Not an S3 URI")
    _, rest = uri.split("s3://", 1)
    bucket, key = rest.split("/", 1)
    return bucket, key

@router.post("/upload", response_model=dict)
async def upload_file(
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    print("upload_file called")
    
    # Check if S3 is configured
    if not (hasattr(settings, 'AWS_S3_BUCKET') and settings.AWS_S3_BUCKET):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="S3 storage is not configured. Please contact an administrator."
        )
    
    # Prepare OCR helper early to fail fast if misconfigured
    try:
        ocr_helper = TextractHelper()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OCR service is not properly configured. Please contact an administrator."
        )

    print("here")
    # Temp dir for OCR
    temp_dir = os.path.join(settings.TEMP_DIRECTORY)
    os.makedirs(temp_dir, exist_ok=True)

    # Build a unique S3 key per user
    file_extension = os.path.splitext(file.filename)[1]
    unique_basename = f"{uuid.uuid4()}{file_extension}"
    s3_key = f"users/{current_user.clerk_id}/{unique_basename}"
    bucket = settings.AWS_S3_BUCKET

    temp_file_path = os.path.join(temp_dir, unique_basename)
    try:
        # Save locally just for OCR
        with open(temp_file_path, "wb") as temp_file:
            shutil.copyfileobj(file.file, temp_file)

        # OCR processing
        try:
            extracted_text = ocr_helper.extract_text_from_pdf(temp_file_path)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"OCR processing failed: {str(e)}"
            )

        # Upload to S3
        s3_client = _s3()
        extra_args = {
            "ContentType": file.content_type or "application/octet-stream",
            "Metadata": {
                "user_id": str(current_user.id),
                "clerk_id": str(current_user.clerk_id),
                "original_filename": file.filename,
                "description": description or "",
                "upload_date": datetime.utcnow().isoformat()
            }
        }
        
        # Add KMS encryption if configured
        if getattr(settings, "AWS_S3_KMS_KEY_ID", None):
            extra_args["ServerSideEncryption"] = "aws:kms"
            extra_args["SSEKMSKeyId"] = settings.AWS_S3_KMS_KEY_ID

        s3_client.upload_file(temp_file_path, bucket, s3_key, ExtraArgs=extra_args)

        # Document store
        metadata = {
            "filename": file.filename,
            "description": description or "",
            "upload_date": datetime.utcnow().isoformat(),
            "report_type": "pdf",
            "s3_uri": _to_s3_uri(bucket, s3_key)
        }
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
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to store document vectors: {str(e)}"
            )

        # Save DB record
        report = Reports(
            file_path=_to_s3_uri(bucket, s3_key),
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
            "report_id": report.id,
            "s3_uri": report.file_path
        }

    except HTTPException:
        raise
    except (BotoCoreError, ClientError) as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"S3 error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"File upload failed: {str(e)}"
        )
    finally:
        # Clean up temp
        try:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
        except Exception:
            pass

@router.get("/files", response_model=List[ReportResponse])
async def list_files(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        reports = (
            db.query(Reports)
            .filter(Reports.user_id == current_user.id)
            .order_by(Reports.uploaded_at.desc())
            .all()
        )
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
            Reports.user_id == current_user.id
        ).first()
        if not report:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
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
        report = db.query(Reports).filter(
            Reports.id == report_id,
            Reports.user_id == current_user.id
        ).first()
        if not report:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

        # 1. Delete from S3 if this is an S3-backed report
        try:
            bucket, key = _from_s3_uri(report.file_path)
            _s3().delete_object(Bucket=bucket, Key=key)
        except ValueError:
            if os.path.exists(report.file_path):
                os.remove(report.file_path)

        # 2. Remove from vector store
        document_store = DocumentStore()
        document_store.delete_document(report_id=report.id, user_id=current_user.clerk_id)

        # 3. Remove the report from DB
        db.delete(report)
        db.commit()

        return {"success": True, "message": "Report deleted successfully"}
    except (BotoCoreError, ClientError) as e:
        raise HTTPException(status_code=502, detail=f"S3 error: {str(e)}")
    except Exception as e:
        print(f"Error deleting document: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")

@router.get("/files/{report_id}/download")
async def download_file(
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
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

        # If S3-backed, return a presigned URL
        if report.file_path.startswith("s3://"):
            bucket, key = _from_s3_uri(report.file_path)
            try:
                # Test if we can access the file first
                s3_client = _s3()
                
                # Check if object exists and get its metadata
                s3_client.head_object(Bucket=bucket, Key=key)
                
                # Generate presigned URL
                params = {
                    "Bucket": bucket,
                    "Key": key,
                    "ResponseContentDisposition": f'attachment; filename="{report.original_filename or os.path.basename(key)}"'
                }
                url = s3_client.generate_presigned_url(
                    ClientMethod="get_object",
                    Params=params,
                    ExpiresIn=getattr(settings, "S3_PRESIGNED_EXPIRES", 900)
                )
                return JSONResponse({
                    "url": url, 
                    "expires_in": getattr(settings, "S3_PRESIGNED_EXPIRES", 900),
                    "filename": report.original_filename
                })
            except (BotoCoreError, ClientError) as e:
                print(f"S3 error details: {e}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"S3 error: {str(e)}"
                )

        # Legacy local-file fallback
        file_path = report.file_path
        if not os.path.exists(file_path):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found on the server")

        raise HTTPException(status_code=410, detail="This report is stored locally and is no longer downloadable")

    except HTTPException:
        raise
    except Exception as e:
        print(f"Download error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate download link: {str(e)}"
        )
