import os
import json
import boto3
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ---- Fetch DB credentials from Secrets Manager ----
def get_rds_secret(secret_name: str, region: str) -> dict:
    client = boto3.client("secretsmanager", region_name=region)
    response = client.get_secret_value(SecretId=secret_name)
    return json.loads(response["SecretString"])

DATABASE_URL = None

# Prefer Secrets Manager if configured
if os.getenv("RDS_SECRET_NAME") and os.getenv("AWS_REGION"):
    secret = get_rds_secret(os.getenv("RDS_SECRET_NAME"), os.getenv("AWS_REGION"))
    db_user = secret["username"]
    db_pass = secret["password"]
    
    # Other connection info from env
    db_host = os.getenv("RDS_HOST")       # e.g. mydb.abc123xyz.us-east-1.rds.amazonaws.com
    db_port = os.getenv("RDS_PORT", "5432")
    db_name = os.getenv("RDS_DB", "postgres")

    DATABASE_URL = f"postgresql+psycopg2://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"
else:
    # Fallback to env var (e.g. for local dev or Neon)
    DATABASE_URL = os.getenv("DATABASE_URL")

# ---- SQLAlchemy setup ----
# On RDS you usually don’t need sslmode=require unless you enabled SSL enforcement.
# If Neon is your fallback, keep it.
connect_args = {"sslmode": "require"} if "neon.tech" in DATABASE_URL else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# ---- FastAPI dependency ----
def get_db():
    """Provide a SQLAlchemy session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
