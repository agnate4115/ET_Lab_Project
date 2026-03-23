"""
ingest.py — Document Ingestion Script for MindBridge RAG Pipeline
=========================================================
Usage:
    python scripts/ingest.py

Place your source documents (PDFs, TXTs) in the source_documents/ directory.
This script will chunk, embed, and store them in ChromaDB with therapy-type metadata.

Therapy keyword mapping tags documents automatically:
  - CBT  → cognitive behavioral, cognitive distortion, thought patterns
  - DBT  → dialectical behavioral, distress tolerance, mindfulness
  - ACT  → acceptance commitment, psychological flexibility, values
  - SFBT → solution focused, exceptions, miracle question
  - MI   → motivational interviewing, ambivalence, change talk
"""
import os
import sys
import logging
from pathlib import Path
from typing import List

# Ensure backend is on the path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

from langchain_community.document_loaders import PyPDFLoader, TextLoader, DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

from rag.vector_store import get_vector_store, COLLECTION_NAME

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

SOURCE_DIR = Path(__file__).parent.parent / "source_documents"

THERAPY_KEYWORDS = {
    "CBT": [
        "cognitive behavioral", "cognitive behaviour", "cognitive distortion",
        "thought record", "automatic thoughts", "beck", "cognitive therapy",
        "behavioral activation", "exposure therapy", "cognitive restructuring",
    ],
    "DBT": [
        "dialectical behavioral", "dialectical behaviour", "distress tolerance",
        "emotion regulation", "interpersonal effectiveness", "radical acceptance",
        "linehan", "wise mind", "chain analysis", "diary card",
    ],
    "ACT": [
        "acceptance commitment", "psychological flexibility", "values clarification",
        "defusion", "committed action", "hexaflex", "relational frame",
        "hayes", "mindfulness act", "present moment awareness",
    ],
    "SFBT": [
        "solution focused", "solution-focused", "miracle question",
        "scaling questions", "exceptions", "de shazer", "brief therapy",
        "preferred future", "coping questions",
    ],
    "MI": [
        "motivational interviewing", "motivational interview", "ambivalence",
        "change talk", "miller rollnick", "rollnick", "oars",
        "sustain talk", "righting reflex", "spirit of mi",
    ],
}


def detect_therapy_type(text: str) -> str:
    """Detect primary therapy type from document text."""
    text_lower = text.lower()
    scores = {t: 0 for t in THERAPY_KEYWORDS}
    for therapy, keywords in THERAPY_KEYWORDS.items():
        for kw in keywords:
            scores[therapy] += text_lower.count(kw)
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "General"


def load_documents() -> List[Document]:
    """Load all documents from source_documents/."""
    if not SOURCE_DIR.exists():
        SOURCE_DIR.mkdir(parents=True)
        logger.warning(f"Created {SOURCE_DIR} — place your PDFs/TXTs here and re-run.")
        return []

    all_docs = []

    # Load PDFs
    pdf_files = list(SOURCE_DIR.glob("**/*.pdf"))
    logger.info(f"Found {len(pdf_files)} PDF file(s)")
    for pdf_path in pdf_files:
        try:
            loader = PyPDFLoader(str(pdf_path))
            docs = loader.load()
            for doc in docs:
                doc.metadata["source_file"] = pdf_path.name
            all_docs.extend(docs)
            logger.info(f"  ✅ Loaded {pdf_path.name} ({len(docs)} pages)")
        except Exception as e:
            logger.error(f"  ❌ Failed to load {pdf_path.name}: {e}")

    # Load TXTs
    txt_files = list(SOURCE_DIR.glob("**/*.txt"))
    logger.info(f"Found {len(txt_files)} TXT file(s)")
    for txt_path in txt_files:
        try:
            loader = TextLoader(str(txt_path), encoding="utf-8")
            docs = loader.load()
            for doc in docs:
                doc.metadata["source_file"] = txt_path.name
            all_docs.extend(docs)
            logger.info(f"  ✅ Loaded {txt_path.name}")
        except Exception as e:
            logger.error(f"  ❌ Failed to load {txt_path.name}: {e}")

    return all_docs


def chunk_documents(docs: List[Document]) -> List[Document]:
    """Split documents into chunks with therapy-type metadata."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = splitter.split_documents(docs)
    logger.info(f"Split into {len(chunks)} chunks")

    # Tag each chunk with detected therapy type
    for chunk in chunks:
        therapy_type = detect_therapy_type(chunk.page_content)
        chunk.metadata["therapy_type"] = therapy_type
        chunk.metadata["source"] = chunk.metadata.get("source_file", "Gale Encyclopedia of Therapy")

    # Log therapy distribution
    from collections import Counter
    dist = Counter(c.metadata["therapy_type"] for c in chunks)
    logger.info(f"Therapy type distribution: {dict(dist)}")

    return chunks


def ingest():
    logger.info("=" * 60)
    logger.info("MindBridge RAG Ingestion Pipeline")
    logger.info("=" * 60)

    # 1. Load
    docs = load_documents()
    if not docs:
        logger.error("No documents found. Add files to source_documents/ and re-run.")
        sys.exit(1)
    logger.info(f"Total pages/documents loaded: {len(docs)}")

    # 2. Chunk
    chunks = chunk_documents(docs)

    # 3. Embed & Store
    logger.info(f"Embedding and storing {len(chunks)} chunks in ChromaDB...")
    vs = get_vector_store()

    # Add in batches of 100 to avoid API rate limits
    batch_size = 100
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        vs.add_documents(batch)
        logger.info(f"  Stored batch {i // batch_size + 1} / {(len(chunks) - 1) // batch_size + 1}")

    logger.info("=" * 60)
    logger.info(f"✅ Ingestion complete! Collection: '{COLLECTION_NAME}'")
    logger.info(f"   Total chunks stored: {len(chunks)}")
    logger.info("=" * 60)


if __name__ == "__main__":
    ingest()
