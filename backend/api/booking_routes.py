"""
Booking Routes — College Therapist Appointment Booking
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Mock therapist data (replace with DB)
THERAPISTS = [
    {
        "id": "t001",
        "name": "Dr. Priya Sharma",
        "specializations": ["CBT", "Anxiety", "Academic Stress"],
        "availability": ["Mon 10:00", "Mon 14:00", "Wed 11:00", "Fri 15:00"],
        "photo": None,
        "bio": "10 years experience in student mental health.",
        "rating": 4.9,
        "sessions_completed": 340,
    },
    {
        "id": "t002",
        "name": "Dr. Arjun Mehta",
        "specializations": ["DBT", "Emotional Regulation", "Depression"],
        "availability": ["Tue 09:00", "Thu 13:00", "Fri 10:00"],
        "photo": None,
        "bio": "Specialist in dialectical behavior therapy for college students.",
        "rating": 4.8,
        "sessions_completed": 210,
    },
    {
        "id": "t003",
        "name": "Ms. Kavya Nair",
        "specializations": ["ACT", "Mindfulness", "Study Skills"],
        "availability": ["Mon 11:00", "Wed 14:00", "Thu 16:00"],
        "photo": None,
        "bio": "ACT practitioner helping students connect with their values.",
        "rating": 4.7,
        "sessions_completed": 180,
    },
]

_bookings: dict = {}


class BookingRequest(BaseModel):
    user_id: str
    user_name: str
    user_email: str
    therapist_id: str
    slot: str  # e.g. "Mon 10:00"
    concern: Optional[str] = None
    preferred_therapy: Optional[str] = None


class BookingResponse(BaseModel):
    booking_id: str
    therapist_name: str
    slot: str
    status: str
    confirmation_message: str


@router.get("/therapists")
async def list_therapists():
    return {"therapists": THERAPISTS}


@router.post("/book", response_model=BookingResponse)
async def book_appointment(req: BookingRequest):
    therapist = next((t for t in THERAPISTS if t["id"] == req.therapist_id), None)
    if not therapist:
        raise HTTPException(status_code=404, detail="Therapist not found")
    
    booking_id = f"BK-{uuid.uuid4().hex[:8].upper()}"
    booking = {
        "booking_id": booking_id,
        "user_id": req.user_id,
        "user_name": req.user_name,
        "user_email": req.user_email,
        "therapist_id": req.therapist_id,
        "therapist_name": therapist["name"],
        "slot": req.slot,
        "concern": req.concern,
        "preferred_therapy": req.preferred_therapy,
        "status": "confirmed",
        "created_at": datetime.utcnow().isoformat(),
    }
    _bookings[booking_id] = booking
    
    logger.info(f"Booking confirmed: {booking_id} for {req.user_email}")
    
    return BookingResponse(
        booking_id=booking_id,
        therapist_name=therapist["name"],
        slot=req.slot,
        status="confirmed",
        confirmation_message=f"Your session with {therapist['name']} is confirmed for {req.slot}. Booking ID: {booking_id}",
    )


@router.get("/bookings/{user_id}")
async def get_user_bookings(user_id: str):
    user_bookings = [b for b in _bookings.values() if b["user_id"] == user_id]
    return {"bookings": user_bookings}
