"""
Voice Routes — Azure Whisper STT (direct URL) + Azure Cognitive TTS
Uses your specific Azure resource endpoints.
"""
import os
import logging
import httpx
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import Response
from pydantic import BaseModel

router = APIRouter()
logger = logging.getLogger(__name__)

WHISPER_API_URL = os.getenv(
    "AZURE_WHISPER_API_URL",
    "https://posopenai.openai.azure.com/openai/deployments/whisper/audio/translations?api-version=2024-06-01"
)
WHISPER_API_KEY = os.getenv("AZURE_WHISPER_API_KEY", "")

AZURE_TTS_KEY    = os.getenv("AZURE_TTS_KEY", "")
AZURE_TTS_REGION = os.getenv("AZURE_TTS_REGION", "westus3")
AZURE_TTS_VOICE  = os.getenv("AZURE_TTS_VOICE_NAME", "en-US-JennyNeural")


@router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    """Transcribe audio using Azure Whisper translations endpoint."""
    try:
        audio_bytes  = await audio.read()
        filename     = audio.filename or "audio.webm"
        content_type = audio.content_type or "audio/webm"

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                WHISPER_API_URL,
                headers={"api-key": WHISPER_API_KEY},
                files={"file": (filename, audio_bytes, content_type)},
                data={"response_format": "json"},
            )

        if resp.status_code != 200:
            logger.error(f"Whisper error {resp.status_code}: {resp.text}")
            raise HTTPException(status_code=502, detail=f"Whisper API error: {resp.text}")

        text = resp.json().get("text", "")
        logger.info(f"Transcribed {len(text)} chars")
        return {"text": text}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Transcription error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


class TTSRequest(BaseModel):
    text: str
    voice: str = ""


@router.post("/speak")
async def text_to_speech(req: TTSRequest):
    """Azure Cognitive Services TTS — returns mp3 audio bytes."""
    try:
        voice = req.voice or AZURE_TTS_VOICE
        text  = req.text[:800]

        token_url = f"https://{AZURE_TTS_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken"
        async with httpx.AsyncClient(timeout=15) as client:
            tok_resp = await client.post(
                token_url,
                headers={"Ocp-Apim-Subscription-Key": AZURE_TTS_KEY},
            )
        if tok_resp.status_code != 200:
            raise HTTPException(status_code=502, detail="TTS token fetch failed")
        token = tok_resp.text

        ssml = f"""<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>
  <voice name='{voice}'>{text}</voice>
</speak>"""

        tts_url = f"https://{AZURE_TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/v1"
        async with httpx.AsyncClient(timeout=30) as client:
            tts_resp = await client.post(
                tts_url,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/ssml+xml",
                    "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
                    "User-Agent": "MindBridge",
                },
                content=ssml.encode("utf-8"),
            )

        if tts_resp.status_code != 200:
            raise HTTPException(status_code=502, detail="TTS synthesis failed")

        return Response(content=tts_resp.content, media_type="audio/mpeg")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"TTS error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/voices")
async def list_voices():
    return {
        "voice": AZURE_TTS_VOICE,
        "region": AZURE_TTS_REGION,
        "available": ["en-US-JennyNeural","en-US-AriaNeural","en-IN-NeerjaNeural","en-IN-PrabhatNeural"]
    }
