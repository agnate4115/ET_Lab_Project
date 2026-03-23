# source_documents/

Place your therapy reference documents here before running ingestion.

## Recommended Files
- `gale_encyclopedia_of_therapy.pdf` — The Gale Encyclopedia of Therapy (primary RAG source)
- Any additional CBT, DBT, ACT, SFBT, or MI reference PDFs or TXTs

## Ingestion
After placing documents here, run:
```bash
cd /path/to/mindbridge
python scripts/ingest.py
```

The script will:
1. Load all PDFs and TXTs from this directory
2. Split into ~1000-token chunks with 150-token overlap
3. Auto-tag each chunk with its therapy type (CBT/DBT/ACT/SFBT/MI/General)
4. Embed using Azure OpenAI text-embedding-ada-002
5. Store in ChromaDB at ./chroma_db/

## Supported Formats
- `.pdf` — Recommended (PyPDF loader)
- `.txt` — Plain text files

## Notes
- Large PDFs (500+ pages) may take several minutes to embed
- Each run adds to the existing collection (does not overwrite)
- To start fresh: delete the `chroma_db/` directory and re-run
