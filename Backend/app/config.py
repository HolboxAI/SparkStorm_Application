# fastapi_project/app/config.py
from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv
from pydantic import field_validator
from typing import Optional

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    """Application configuration settings."""
    PROJECT_NAME: str = "SparkStorm FastAPI"
    VERSION: str = "0.1.0"
    DESCRIPTION: str = "FastAPI backend for SparkStorm, migrated from Django."

    # Database configuration (example using PostgreSQL)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@host:port/dbname")

    # Security settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # File upload settings
    UPLOAD_DIRECTORY: str = os.getenv("UPLOAD_DIRECTORY", "uploads")
    TEMP_DIRECTORY: str = os.getenv("TEMP_DIRECTORY", "temp")
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10 MB

    # Azure OCR settings
    AZURE_VISION_ENDPOINT: Optional[str] = os.getenv("AzureOcrEndpoint")
    AZURE_VISION_KEY: Optional[str] = os.getenv("AzureOcrKey")

    # Vector store settings
    CHROMA_PERSIST_DIRECTORY: str = os.getenv("CHROMA_PERSIST_DIRECTORY", "chroma_db")
    EMBEDDING_MODEL_NAME: str = os.getenv("EMBEDDING_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")

    # LLM settings
    OPENAI_API_KEY: Optional[str] = None
    LLM_MODEL_NAME: str = "gpt-4"

    # Gemini settings
    GEMINI_API_KEY: Optional[str] = None

    # AWS settings
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    RDS_SECRET_NAME: str = os.getenv("RDS_SECRET_NAME", "")
    AWS_S3_BUCKET: str = os.getenv("AWS_S3_BUCKET", "")  # ADD THIS LINE
    AWS_S3_KMS_KEY_ID: Optional[str] = os.getenv("AWS_S3_KMS_KEY_ID", None)  # Optional KMS key

    # Clerk settings (if needed)
    CLERK_WEBHOOK_SECRET: Optional[str] = os.getenv("CLERK_WEBHOOK_SECRET")
    CLERK_API_KEY: Optional[str] = os.getenv("CLERK_API_KEY")
    CLERK_SECRET_KEY: Optional[str] = os.getenv("CLERK_SECRET_KEY")

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        extra = "ignore"

    # Add validation for AWS settings
    @field_validator("AWS_S3_BUCKET", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY")
    @classmethod
    def validate_aws_settings(cls, v: str) -> str:
        if not v:
            print("WARNING: AWS settings not properly configured. S3 functionality will be disabled.")
        return v

    @field_validator("AZURE_VISION_ENDPOINT", "AZURE_VISION_KEY")
    @classmethod
    def validate_azure_settings(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            print("WARNING: Azure Vision settings not properly configured. OCR functionality will be disabled.")
        return v
        
    @field_validator("OPENAI_API_KEY")
    @classmethod
    def validate_openai_settings(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            print("WARNING: OpenAI API key not set. OpenAI functionality will be disabled.")
        return v
    
    @field_validator("GEMINI_API_KEY")
    @classmethod
    def validate_gemini_settings(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            print("WARNING: Gemini API key not set. Gemini functionality will be disabled.")
        return v
    
    # Add a method to check if OCR is configured
    def is_ocr_configured(self) -> bool:
        return bool(self.AZURE_VISION_KEY and self.AZURE_VISION_ENDPOINT)
    
    # Add a method to check if LLM is configured
    def is_llm_configured(self) -> bool:
        return bool(self.OPENAI_API_KEY)
    
    # Add a method to check if AWS S3 is configured
    def is_s3_configured(self) -> bool:
        return bool(self.AWS_S3_BUCKET and self.AWS_ACCESS_KEY_ID and self.AWS_SECRET_ACCESS_KEY)

settings = Settings()