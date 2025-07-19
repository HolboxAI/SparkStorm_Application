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

    AWS_REGION: str
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str

    class Config:
        # If your .env file is in the root directory (one level up from app/)
        # env_file = "../.env"
        # If your .env file is in the same directory as config.py
        env_file = ".env" # Or specify the path if it's elsewhere
        env_file_encoding = 'utf-8'
        extra = "ignore" # Ignore extra fields from env file

    # Add validation and default values
    @field_validator("AZURE_VISION_ENDPOINT", "AZURE_VISION_KEY")
    @classmethod
    def validate_azure_settings(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            print(f"WARNING: Azure Vision settings not properly configured. OCR functionality will be disabled.")
        return v
        
    @field_validator("OPENAI_API_KEY")
    @classmethod
    def validate_openai_settings(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            print(f"WARNING: OpenAI API key not set. OpenAI functionality will be disabled.")
        return v
    
    @field_validator("GEMINI_API_KEY")
    @classmethod
    def validate_gemini_settings(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            print(f"WARNING: Gemini API key not set. Gemini functionality will be disabled.")
        return v
    
    # Add a method to check if OCR is configured
    def is_ocr_configured(self) -> bool:
        return bool(self.AZURE_VISION_KEY and self.AZURE_VISION_ENDPOINT)
    
    # Add a method to check if LLM is configured
    def is_llm_configured(self) -> bool:
        return bool(self.OPENAI_API_KEY)

settings = Settings()
