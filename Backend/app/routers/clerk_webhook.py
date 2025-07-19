from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from ..models.users import User
from ..databse import get_db

router = APIRouter()

@router.get("")
async def clerk_webhook_info():
    """
    Endpoint to provide information about the Clerk webhook.
    This can be used to verify that the webhook is set up correctly.
    """
    return {"message": "Clerk webhook endpoint is active. Use POST to send events."}

@router.post("")
async def clerk_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.json()

    event_type = payload.get("type")
    data = payload.get("data")

    if not event_type or not data:
        raise HTTPException(status_code=400, detail="Missing event type or data")

    clerk_user_id = data.get("id")

    # Extract primary email from email_addresses array
    email_addresses = data.get("email_addresses", [])
    primary_email = None

    primary_email_id = data.get("primary_email_address_id")

    for email_obj in email_addresses:
        if email_obj.get("id") == primary_email_id:
            primary_email = email_obj.get("email_address")
            break
    # fallback if primary_email_id missing or not found
    if not primary_email and email_addresses:
        primary_email = email_addresses[0].get("email_address")

    first_name = data.get("first_name")
    last_name = data.get("last_name")
    username = data.get("username") or primary_email  # fallback to email if username is null
    now = datetime.utcnow()

    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="Missing user id")

    # For created and updated events, require an email
    if event_type in ("user.created", "user.updated") and not primary_email:
        raise HTTPException(status_code=400, detail="Missing email address")

    user = db.query(User).filter(User.clerk_id == clerk_user_id).first()

    if event_type == "user.created":
        if user:
            # Update user
            user.email = primary_email
            user.username = username
            user.first_name = first_name
            user.last_name = last_name
            user.is_active = True
            user.updated_at = now
        else:
            user = User(
                clerk_id=clerk_user_id,
                email=primary_email,
                username=username,
                first_name=first_name,
                last_name=last_name,
                is_active=True,
                created_at=now,
                updated_at=now,
            )
            db.add(user)
        db.commit()
        return {"message": "User created processed"}

    elif event_type == "user.updated":
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.email = primary_email
        user.username = username
        user.first_name = first_name
        user.last_name = last_name
        user.updated_at = now
        db.commit()
        return {"message": "User updated processed"}

    elif event_type == "user.deleted":
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.is_active = False
        user.updated_at = now
        db.commit()
        return {"message": "User deleted processed"}

    else:
        raise HTTPException(status_code=400, detail="Unsupported event type")
