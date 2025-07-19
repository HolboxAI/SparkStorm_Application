# Sparkstorm

A FastAPI-based backend API with modular routers, CORS support, and database integration.

---

## Project Overview

This project is a backend API built with **FastAPI**. It provides authentication, user management, report handling, and chatbot functionalities via separate routers. The app is designed to be flexible with CORS settings and includes database setup for persistence.

---

## Features

- FastAPI app with OpenAPI docs
- Modular router structure:
  - Authentication (`/auth`)
  - User management (`/api/users`)
  - Reports management (`/api/reports`)
  - Chatbot interaction (`/api/chatbot`)
- CORS configured for frontend integration
- Database setup using SQLAlchemy ORM
- Directory setup for uploads and temporary files
- Root endpoint for quick health check

---

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd fastapi_project

2. Create and activate a virtual environment (recommended):

    ```bash
    python3 -m venv venv
    source venv/bin/activate   # On Windows: venv\Scripts\activate
    ```
3. Install dependencies:

    ```bash
    pip install -r requirements.txt
    ```
4. Create a `.env` file in the project root and add the following environment variables with your own values:

    ```env
    DATABASE_URL=
    SECRET_KEY=
    CHROMA_PERSIST_DIRECTORY=./chroma_db
    EMBEDDING_MODEL_NAME=
    LLM_MODEL_NAME=
    GeminiKey=
    OPENAI_API_KEY=
    AzureOcrEndpoint=
    AzureOcrKey=

    AWS_ACCESS_KEY_ID=
    AWS_SECRET_ACCESS_KEY=
    AWS_REGION=us-east-1


## Configuration

Configure your project settings in `app/config.py`. Key settings include:

- `PROJECT_NAME` — Project title
- `VERSION` — API version
- `DESCRIPTION` — API description
- `UPLOAD_DIRECTORY` — Path to store uploaded files
- `TEMP_DIRECTORY` — Path for temporary files

Make sure these directories are writable or adjust paths accordingly.

---

## Running the Application

Start the FastAPI server with:

```bash
uvicorn main:app --reload

The API will be accessible at `http://localhost:8000`.

OpenAPI documentation is available at `http://localhost:8000/docs`.

---

## API Endpoints

| Path               | Description                  | Tags           |
|--------------------|------------------------------|----------------|
| `/`                | Root endpoint, health check  | Root           |
| `/auth/*`          | Authentication routes        | Authentication |
| `/api/users/*`     | User management routes       | Users          |
| `/api/reports/*`   | Reports related routes       | Reports        |
| `/api/chatbot/*`   | Chatbot interaction routes   | Chatbot        |

---

## CORS Configuration

By default, CORS allows all origins (`"*"`). Adjust `allow_origins` in `main.py` middleware to restrict access for security:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://localhost:3000"],  # Adjust accordingly
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
