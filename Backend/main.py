# fastapi_project/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Use absolute imports
from app.config import settings
from app.databse import Base, engine

# Initialize the FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    # Add other FastAPI parameters as needed (e.g., docs_url, redoc_url)
)

# Configure CORS (Cross-Origin Resource Sharing)
# Adjust origins based on your frontend setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Or specify allowed origins: ["http://localhost", "http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"], # Or specify allowed methods: ["GET", "POST"]
    allow_headers=["*"], # Or specify allowed headers
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# Create upload directories
os.makedirs(settings.UPLOAD_DIRECTORY, exist_ok=True)
os.makedirs(settings.TEMP_DIRECTORY, exist_ok=True)

@app.get("/", tags=["Root"])
async def read_root():
    """A simple root endpoint to check if the API is running."""
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}

# Import routers
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.reports import router as reports_router
from app.routers.chatbot import router as chatbot_router
from app.routers.clerk_webhook import router as clerk_webhook_router

# Include routers
# app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(users_router, prefix="/api/users", tags=["Users"])
app.include_router(reports_router, prefix="/api/reports", tags=["Reports"])
app.include_router(chatbot_router, prefix="/api/chatbot", tags=["Chatbot"])
app.include_router(clerk_webhook_router, prefix="/api/clerk-webhook", tags=["Clerk Webhooks"])

# Create database tables
Base.metadata.create_all(bind=engine)

print(f"FastAPI app initialized with settings: {settings.PROJECT_NAME}")
# You might add database initialization logic here if needed (e.g., creating tables)
# from .database import Base, engine
# Base.metadata.create_all(bind=engine) # Be cautious using this in production
