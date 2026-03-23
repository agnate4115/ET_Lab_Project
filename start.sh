#!/bin/bash
# ============================================================
#  MindBridge — One-command startup script
#  Usage:  bash start.sh
#  With ngrok:  bash start.sh --ngrok
# ============================================================

set -e

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
USE_NGROK=false
[[ "$1" == "--ngrok" ]] && USE_NGROK=true

echo ""
echo -e "${BLUE}${BOLD}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}${BOLD}║   🧠  MindBridge — Student Mental Health AI  ║${NC}"
echo -e "${BLUE}${BOLD}╚══════════════════════════════════════════════╝${NC}"
echo ""

# ── 1. Check .env ────────────────────────────────────────────
if [ ! -f "$ROOT_DIR/.env" ]; then
  echo -e "${RED}✗ .env not found! Run: cp .env.example .env${NC}"
  exit 1
fi
echo -e "${GREEN}✓ .env found${NC}"

# ── Load .env safely (handles quoted values and spaces) ──────
load_env() {
  local envfile="$1"
  while IFS= read -r line || [ -n "$line" ]; do
    # Skip blank lines and comments
    [[ "$line" =~ ^[[:space:]]*$ ]] && continue
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    # Strip trailing comments
    line="${line%%#*}"
    # Strip trailing whitespace
    line="${line%"${line##*[![:space:]]}"}"
    [[ -z "$line" ]] && continue
    # Split key=value
    key="${line%%=*}"
    val="${line#*=}"
    # Strip surrounding single or double quotes
    val="${val#\"}" ; val="${val%\"}"
    val="${val#\'}" ; val="${val%\'}"
    # Export
    export "$key=$val" 2>/dev/null || true
  done < "$envfile"
}

load_env "$ROOT_DIR/.env"

# ── 2. Validate critical vars ────────────────────────────────
echo -e "${BOLD}Checking credentials...${NC}"
MISSING=0
check_var() {
  local v=$1
  local val="${!v}"
  if [ -z "$val" ]; then
    echo -e "  ${RED}✗ $v is empty${NC}"
    MISSING=$((MISSING+1))
  else
    echo -e "  ${GREEN}✓ $v${NC}"
  fi
}
check_var "AZURE_OPENAI_API_KEY"
check_var "AZURE_WHISPER_API_KEY"
check_var "AZURE_TTS_KEY"
check_var "TWILIO_ACCOUNT_SID"
check_var "TWILIO_AUTH_TOKEN"
check_var "TWILIO_PHONE_NUMBER"
check_var "VAPI_API_KEY"
check_var "VAPI_ASSISTANT_ID"
check_var "GMAIL_SENDER"
check_var "GMAIL_APP_PASSWORD"

if [ $MISSING -gt 0 ]; then
  echo -e "\n${RED}✗ $MISSING variable(s) missing. Edit .env and re-run.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ All credentials present${NC}"

# ── 3. Python check ──────────────────────────────────────────
echo ""
echo -e "${BOLD}Checking Python 3...${NC}"
if ! command -v python3 &>/dev/null; then
  echo -e "${RED}✗ python3 not found. Install Python 3.11+${NC}"; exit 1
fi
echo -e "${GREEN}✓ $(python3 --version)${NC}"

# ── 4. Node check ────────────────────────────────────────────
echo -e "${BOLD}Checking Node.js...${NC}"
if ! command -v node &>/dev/null; then
  echo -e "${RED}✗ node not found. Install Node.js 20+${NC}"; exit 1
fi
echo -e "${GREEN}✓ Node $(node --version)${NC}"

# ── 5. Python venv + deps ────────────────────────────────────
echo ""
echo -e "${BOLD}Setting up Python backend...${NC}"
cd "$ROOT_DIR/backend"
if [ ! -d "venv" ]; then
  echo -e "  ${CYAN}Creating virtual environment...${NC}"
  python3 -m venv venv
fi
source venv/bin/activate
echo -e "  ${CYAN}Installing Python packages (may take a minute first time)...${NC}"
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo -e "${GREEN}✓ Python backend ready${NC}"

# ── 6. Node deps ─────────────────────────────────────────────
echo ""
echo -e "${BOLD}Setting up React frontend...${NC}"
cd "$ROOT_DIR/frontend"
if [ ! -d "node_modules" ]; then
  echo -e "  ${CYAN}Installing npm packages (first run ~1 min)...${NC}"
  npm install --silent
fi
echo -e "${GREEN}✓ Frontend ready${NC}"

# ── 7. Ingest docs (first time only) ─────────────────────────
echo ""
if [ ! -d "$ROOT_DIR/chroma_db" ]; then
  echo -e "${BOLD}${CYAN}First-time RAG ingestion — indexing therapy documents...${NC}"
  cd "$ROOT_DIR"
  source backend/venv/bin/activate
  python scripts/ingest.py
  echo -e "${GREEN}✓ ChromaDB ready${NC}"
else
  echo -e "${GREEN}✓ ChromaDB already exists (skipping ingestion)${NC}"
  echo -e "  ${YELLOW}Tip: rm -rf chroma_db && bash start.sh to re-ingest${NC}"
fi

# ── 8. Free ports ────────────────────────────────────────────
echo ""
echo -e "${CYAN}Freeing ports 8000 and 5173...${NC}"
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
sleep 1

# ── 9. Start ngrok (optional --ngrok flag) ───────────────────
NGROK_URL=""
NGROK_PID=""
if $USE_NGROK; then
  if ! command -v ngrok &>/dev/null; then
    echo -e "${YELLOW}⚠  ngrok not found. Install from https://ngrok.com/download${NC}"
  else
    echo -e "${CYAN}Starting ngrok tunnel on port 8000...${NC}"
    ngrok http 8000 --log=stdout > /tmp/ngrok_mb.log 2>&1 &
    NGROK_PID=$!
    sleep 4
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null \
      | python3 -c "
import sys, json
try:
    t = json.load(sys.stdin)['tunnels']
    print([x['public_url'] for x in t if x['proto']=='https'][0])
except:
    pass
" 2>/dev/null || echo "")
    if [ -n "$NGROK_URL" ]; then
      echo -e "${GREEN}✓ ngrok tunnel active: ${CYAN}$NGROK_URL${NC}"
      # Update BACKEND_URL in .env
      if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|^BACKEND_URL=.*|BACKEND_URL=$NGROK_URL|" "$ROOT_DIR/.env"
      else
        sed -i "s|^BACKEND_URL=.*|BACKEND_URL=$NGROK_URL|" "$ROOT_DIR/.env"
      fi
      export BACKEND_URL="$NGROK_URL"
      echo -e "${GREEN}✓ BACKEND_URL updated to $NGROK_URL${NC}"
    else
      echo -e "${YELLOW}⚠  Could not read ngrok URL automatically. Check http://localhost:4040${NC}"
    fi
  fi
fi

# ── 10. Start backend ────────────────────────────────────────
echo ""
echo -e "${CYAN}Starting FastAPI backend on port 8000...${NC}"
cd "$ROOT_DIR/backend"
source venv/bin/activate
uvicorn main:app --reload --port 8000 --host 0.0.0.0 &
BACKEND_PID=$!

echo -e "${CYAN}Waiting for backend to be ready...${NC}"
for i in {1..30}; do
  sleep 1
  if curl -s http://localhost:8000/health >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is up!${NC}"
    break
  fi
  if [ $i -eq 30 ]; then
    echo -e "${RED}✗ Backend failed to start. Check errors above.${NC}"; exit 1
  fi
done

# ── 11. Start frontend ───────────────────────────────────────
echo ""
echo -e "${CYAN}Starting React frontend on port 5173...${NC}"
cd "$ROOT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!
sleep 2

# ── 12. Print summary ────────────────────────────────────────
echo ""
echo -e "${BLUE}${BOLD}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║         ✅  MindBridge is running!           ║${NC}"
echo -e "${BLUE}${BOLD}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BOLD}🌐 App:${NC}       ${CYAN}http://localhost:5173${NC}"
echo -e "  ${BOLD}⚙️  API:${NC}       ${CYAN}http://localhost:8000${NC}"
echo -e "  ${BOLD}📖 Docs:${NC}      ${CYAN}http://localhost:8000/docs${NC}"
echo ""

if [ -n "$NGROK_URL" ]; then
  echo -e "  ${BOLD}🌍 Public:${NC}    ${MAGENTA}$NGROK_URL${NC}"
  echo -e "  ${BOLD}🔗 Webhook:${NC}   ${MAGENTA}$NGROK_URL/api/vapi/webhook${NC}"
  echo ""
  echo -e "  ${YELLOW}↑ Paste the Webhook URL into:${NC}"
  echo -e "  ${YELLOW}  dashboard.vapi.ai → Assistants → MindBridge Intake → Server URL${NC}"
else
  echo -e "  ${YELLOW}⚠️  For VAPI call transcripts, expose your backend:${NC}"
  echo -e "  ${YELLOW}  Option A: bash start.sh --ngrok  (auto-setup)${NC}"
  echo -e "  ${YELLOW}  Option B: In a new terminal → ngrok http 8000${NC}"
  echo -e "  ${YELLOW}            Then paste URL/api/vapi/webhook into VAPI dashboard${NC}"
fi

echo ""
echo -e "  Press ${BOLD}Ctrl+C${NC} to stop all services"
echo ""

# ── Graceful shutdown ────────────────────────────────────────
cleanup() {
  echo ""
  echo -e "${YELLOW}Shutting down MindBridge...${NC}"
  kill $BACKEND_PID  2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  [ -n "$NGROK_PID" ] && kill $NGROK_PID 2>/dev/null || true
  echo -e "${GREEN}Done. Goodbye!${NC}"
  exit 0
}
trap cleanup INT TERM
wait
