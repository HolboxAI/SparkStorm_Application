import os
import json
from urllib.parse import quote_plus

import boto3
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ---------------------------
# Fetch DB credentials from Secrets Manager
# ---------------------------
def get_rds_secret(secret_name: str, region: str) -> dict:
    """
    Fetch RDS credentials stored in AWS Secrets Manager.
    """
    client = boto3.client("secretsmanager", region_name=region)
    response = client.get_secret_value(SecretId=secret_name)
    secret = json.loads(response["SecretString"])
    return secret

# ---------------------------
# Build the DATABASE_URL
# ---------------------------
def build_database_url():
    """
    Construct SQLAlchemy DATABASE_URL using either Secrets Manager or local env.
    Automatically URL-encodes username/password to handle special characters.
    Adds sslmode=require for RDS connections.
    """
    secret_name = os.getenv("RDS_SECRET_NAME")
    aws_region = os.getenv("AWS_REGION")

    if secret_name and aws_region:
        # Use Secrets Manager
        secret = get_rds_secret(secret_name, aws_region)
        db_user = quote_plus(secret["username"])
        db_pass = quote_plus(secret["password"])
        db_host = secret.get("host") or os.getenv("RDS_HOST")
        db_port = secret.get("port") or os.getenv("RDS_PORT", "5432")
        db_name = secret.get("dbname") or os.getenv("RDS_DB", "postgres")

        # Enforce SSL for RDS
        return f"postgresql+psycopg2://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}?sslmode=require"

    # Fallback to DATABASE_URL env variable (e.g., for local dev)
    return os.getenv("DATABASE_URL")


# ---------------------------
# SQLAlchemy setup
# ---------------------------
DATABASE_URL = build_database_url()
print(f"Connecting to DB: {DATABASE_URL.split('@')[1]}")  # safe: hides username/password

# Connect args (can include sslmode if needed)
connect_args = {}
if "sslmode=require" in DATABASE_URL:
    connect_args["sslmode"] = "require"

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,     # auto-reconnect stale connections
    pool_recycle=3600,      # recycle connections every hour
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ---------------------------
# FastAPI DB dependency
# ---------------------------
def get_db():
    """
    Provide a SQLAlchemy session per request in FastAPI.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
