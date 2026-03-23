# MindBridge — Setup Guide

## What You Already Have ✅
- Azure OpenAI (GPT-4o, Whisper, TTS) — all configured
- Firebase project — configured  
- Gmail App Password — configured

## What You Still Need
- Twilio phone number (free trial credits)
- VAPI API key + Assistant ID

---

## Step 1 — Get Twilio Credentials

1. Go to **console.twilio.com** → Sign in
2. On the dashboard you'll see:
   - **Account SID** → copy to `.env` as `TWILIO_ACCOUNT_SID`
   - **Auth Token** (click to reveal) → copy to `.env` as `TWILIO_AUTH_TOKEN`
3. Left sidebar → **Phone Numbers** → **Manage** → **Active Numbers**
   - If you have a free trial number, copy it (e.g. `+12015551234`) → `TWILIO_PHONE_NUMBER`
   - If not: **Buy a Number** → choose any US number → ~$1/month (free trial credits cover this)

Your `.env` should have:
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
```

---

## Step 2 — Get VAPI Credentials

1. Go to **dashboard.vapi.ai** → Sign up (free)
2. Left sidebar → **API Keys** → Copy → `VAPI_API_KEY`
3. Left sidebar → **Assistants** → **Create Assistant**
   - Name: `MindBridge Intake`
   - Model: GPT-4o (or any)
   - The system prompt is overridden dynamically by the backend, so defaults are fine
   - Click **Save** → Copy the Assistant ID → `VAPI_ASSISTANT_ID`
4. **Set your webhook URL in VAPI:**
   - Go to the assistant settings → **Server URL**
   - For local dev: run `ngrok http 8000` → use `https://xxxx.ngrok.io/api/vapi/webhook`
   - For production: `https://yourdomain.com/api/vapi/webhook`

---

## Step 3 — How Twilio + VAPI Work Together

```
You click "Initiate Call"
        ↓
Backend → Twilio REST API → dials patient's phone
        ↓
Patient picks up
        ↓
Twilio fetches TwiML from /api/vapi/twiml
        ↓
TwiML streams call audio to VAPI WebSocket
        ↓
VAPI AI conducts interview (using your Azure GPT-4o)
        ↓
Call ends → VAPI sends transcript to /api/vapi/webhook
        ↓
Backend generates PDF report (ReportLab + AI summary)
        ↓
PDF emailed to neilgupta04@gmail.com
```

> **Free trial note:** Twilio free trial can only call **verified numbers**.
> Go to Twilio Console → **Verified Caller IDs** → add the patient's number before calling.
> (Remove this restriction by upgrading to paid — ~$20 adds $20 credit)

---

## Step 4 — Fill Your .env

```env
# Already set for you:
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_WHISPER_API_KEY=your-azure-whisper-api-key
AZURE_WHISPER_API_URL=https://your-resource.openai.azure.com/openai/deployments/whisper/audio/translations?api-version=2024-06-01
AZURE_TTS_KEY=your-azure-tts-key
AZURE_TTS_REGION=westus3
AZURE_TTS_VOICE_NAME=en-US-JennyNeural
GMAIL_SENDER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
DOCTOR_EMAIL=doctor-email@gmail.com
VITE_FIREBASE_API_KEY=your-firebase-api-key
# ... (rest of Firebase already set)

# Still needed:
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
VAPI_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
VAPI_ASSISTANT_ID=xxxxxxxxxxxxxxxxxxxxxxxx
BACKEND_URL=https://your-ngrok-url-or-domain.com  ← important for webhooks!
```

---

## Step 5 — Run the Project

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# In a new terminal — expose to internet (for webhooks)
ngrok http 8000
# Copy the https://xxxx.ngrok.io URL → set as BACKEND_URL in .env

# Ingest documents
cd ..
python scripts/ingest.py

# Frontend (in a new terminal)
cd frontend
npm install
npm run dev
# Open: http://localhost:5173
```

---

## Architecture Summary

| Component | Service | Purpose |
|-----------|---------|---------|
| Phone calls | **Twilio** | Dials patient, bridges audio |
| AI conversation | **VAPI** | Runs GPT-4o interview agent |
| Transcription | **Azure Whisper** | Browser voice → text |
| Text-to-speech | **Azure Cognitive TTS** | AI response → voice |
| Chat LLM | **Azure GPT-4o** | Therapy agents (CBT/DBT/ACT/SFBT/MI) |
| RAG | **ChromaDB** | Gale Encyclopedia embeddings |
| Auth | **Firebase** | Google sign-in |
| Reports | **ReportLab** | PDF generation |
| Email | **Gmail SMTP** | Send report to doctor |
