import requests
from jose import jwt
from fastapi import Header, HTTPException
# app/core/auth.py
from datetime import datetime, timedelta
import os
from typing import Optional, Union, Any
from jose import jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import ValidationError

from ..config import settings
from ..models.users import User
from ..databse import get_db

JWKS_URL = "https://quick-starfish-16.clerk.accounts.dev/.well-known/jwks.json"
CLERK_ISSUER = "https://quick-starfish-16.clerk.accounts.dev"
CLERK_AUDIENCE = os.getenv("CLERK_API_KEY")

jwks = requests.get(JWKS_URL).json()

def get_signing_key(kid):
    for key in jwks["keys"]:
        if key["kid"] == kid:
            return key
    raise HTTPException(401, "Signing key not found")

async def verify_clerk_token(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Invalid authorization header")

    token = authorization.split(" ")[1]

    try:
        unverified_header = jwt.get_unverified_header(token)
        signing_key = get_signing_key(unverified_header["kid"])

        payload = jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"],
            audience=CLERK_AUDIENCE,
            issuer=CLERK_ISSUER,
        )
        clerk_user_id = payload.get("sub")
        if not clerk_user_id:
            raise HTTPException(401, "Invalid token payload: missing user id")
        return clerk_user_id

    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token has expired")
    except jwt.JWTClaimsError as e:
        raise HTTPException(401, f"Invalid claims: {str(e)}")
    except Exception as e:
        raise HTTPException(401, f"Token validation error: {str(e)}")


def get_current_user(
    clerk_user_id: str = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.clerk_id == clerk_user_id).first()
    if not user:
        print(f"User with Clerk ID {clerk_user_id} not found in database.")
        raise HTTPException(404, "User not found")
    print(f"Current user: {user.email} (ID: {user.clerk_id})")  # Debug log
    return user
