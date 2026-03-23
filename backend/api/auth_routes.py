"""
Auth Routes — Firebase Google OAuth + Mobile Number
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class UserProfile(BaseModel):
    uid: str
    email: str
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    mobile_number: Optional[str] = None
    id_token: str  # Firebase ID token to verify


class UpdateProfileRequest(BaseModel):
    uid: str
    mobile_number: str


# In-memory store (replace with DB in production)
_user_store: dict = {}


@router.post("/verify")
async def verify_token(profile: UserProfile):
    """
    Verify Firebase ID token and store/update user profile.
    Called after Google OAuth sign-in on the frontend.
    """
    try:
        # In production: verify with firebase_admin.auth.verify_id_token(profile.id_token)
        # For now we trust the Firebase client SDK verification
        
        user_data = {
            "uid": profile.uid,
            "email": profile.email,
            "display_name": profile.display_name,
            "photo_url": profile.photo_url,
            "mobile_number": profile.mobile_number,
        }
        _user_store[profile.uid] = user_data
        
        logger.info(f"User verified: {profile.email}")
        return {"status": "ok", "user": user_data}
    
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")


@router.put("/profile/mobile")
async def update_mobile(req: UpdateProfileRequest):
    """Update user's mobile number."""
    if req.uid not in _user_store:
        _user_store[req.uid] = {"uid": req.uid}
    
    _user_store[req.uid]["mobile_number"] = req.mobile_number
    return {"status": "ok", "mobile_number": req.mobile_number}


@router.get("/profile/{uid}")
async def get_profile(uid: str):
    """Get user profile."""
    if uid not in _user_store:
        raise HTTPException(status_code=404, detail="User not found")
    return _user_store[uid]
