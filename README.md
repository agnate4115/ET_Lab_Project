# MindBridge — Student Mental Health AI Platform

## Overview
MindBridge is a full-stack agentic RAG platform for student mental health support during online learning. It features:
- **4 Therapy Agents**: CBT, DBT, ACT, SFBT & MI — powered by LangGraph
- **RAG Pipeline**: Azure OpenAI + Gale Encyclopedia of Therapy ingestion
- **Voice**: Azure Whisper (STT) + Azure TTS + VAPI phone call integration
- **Auth**: Google OAuth + mobile number capture
- **Booking**: College therapist appointment booking
- **VAPI Workflow**: AI-initiated patient intake calls → PDF report → Gmail to doctor

## Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, TailwindCSS |
| Auth | Firebase (Google OAuth) |
| Backend | FastAPI (Python) |
| Agents | LangGraph + LangChain |
| RAG | Azure OpenAI Embeddings + ChromaDB |
| LLM | Azure OpenAI GPT-4o |
| STT | Azure Whisper |
| TTS | Azure OpenAI TTS |
| Voice Calls | VAPI |
| Reports | ReportLab PDF |
| Email | Gmail API / SMTP |

## Setup

### 1. Environment Variables
```bash
cp .env.example .env
# Fill in all values
```

### 2. Install Backend
```bash
cd backend
pip install -r requirements.txt
```

### 3. Ingest Documents
```bash
# Place PDFs in source_documents/
python scripts/ingest.py
```

### 4. Install Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Run Backend
```bash
cd backend
uvicorn main:app --reload --port 8000
```

## Project Structure
```
mindbridge/
├── frontend/                  # React dashboard
│   └── src/
│       ├── pages/             # Auth, Dashboard, Therapy, Booking
│       ├── components/        # Reusable UI components
│       └── context/           # Auth, Theme contexts
├── backend/                   # FastAPI server
│   ├── agents/                # LangGraph therapy agents (CBT/DBT/ACT/SFBT/MI)
│   ├── rag/                   # RAG pipeline & vector store
│   ├── api/                   # REST endpoints
│   ├── vapi/                  # VAPI webhook handlers
│   └── email/                 # Gmail report sender
├── source_documents/          # Drop Gale Encyclopedia PDFs here
└── scripts/
    └── ingest.py              # Document ingestion script
```
