"""
MindBridge Backend — FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from api.auth_routes import router as auth_router
from api.therapy_routes import router as therapy_router
from api.booking_routes import router as booking_router
from api.vapi_routes import router as vapi_router
from api.voice_routes import router as voice_router
from rag.vector_store import ensure_collection_exists

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    logger.info("🚀 MindBridge backend starting up...")
    try:
        ensure_collection_exists()
        logger.info("✅ Vector store ready")
    except Exception as e:
        logger.warning(f"⚠️  Vector store init warning: {e}")
    yield
    logger.info("👋 MindBridge backend shutting down")


app = FastAPI(
    title="MindBridge API",
    description="Agentic RAG Mental Health Platform for Students",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(therapy_router, prefix="/api/therapy", tags=["Therapy"])
app.include_router(booking_router, prefix="/api/booking", tags=["Booking"])
app.include_router(vapi_router, prefix="/api/vapi", tags=["VAPI"])
app.include_router(voice_router, prefix="/api/voice", tags=["Voice"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "MindBridge API v1.0.0"}
