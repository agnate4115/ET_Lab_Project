#!/usr/bin/env python3
import os
from typing import List
from tqdm import tqdm
from datasets import load_dataset
import glob

from langchain.docstore.document import Document
from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings
from constants import CHROMA_SETTINGS

# Load environment variables
persist_directory = os.environ.get('PERSIST_DIRECTORY', 'db')
source_directory = os.environ.get('SOURCE_DIRECTORY', 'source_documents')
embeddings_model_name = os.environ.get('EMBEDDINGS_MODEL_NAME', 'all-MiniLM-L6-v2')

def find_parquet_file(directory):
    parquet_files = glob.glob(os.path.join(directory, '*.parquet'))
    if not parquet_files:
        raise FileNotFoundError(f"No Parquet file found in {directory}")
    return parquet_files[0]  # Return the first Parquet file found

def load_and_process_dataset() -> List[Document]:
    """
    Load and process the therapy dataset from the Parquet file
    """
    dataset_path = find_parquet_file(source_directory)
    print(f"Loading dataset from: {dataset_path}")
    
    # Load the dataset
    dataset = load_dataset("parquet", data_files=dataset_path)["train"]
    
    documents = []
    for i, row in enumerate(tqdm(dataset, desc="Processing entries")):
        entry = row['train']  # Assuming 'train' is the column name
        
        # Split the content into human and assistant parts
        parts = entry.split('[/INST]')
        if len(parts) == 2:
            human_part = parts[0].strip()[len('<s>[INST] '):]
            assistant_part = parts[1].strip()[:-len('</s>')]
            
            # Create separate documents for human and assistant parts
            human_doc = Document(
                page_content=human_part,
                metadata={"source": dataset_path, "index": i, "role": "human"}
            )
            assistant_doc = Document(
                page_content=assistant_part,
                metadata={"source": dataset_path, "index": i, "role": "assistant"}
            )
            documents.extend([human_doc, assistant_doc])
        else:
            print(f"Skipping malformed entry at index {i}")
    
    print(f"Loaded and processed {len(documents)} entries from the dataset")
    return documents

def does_vectorstore_exist(persist_directory: str) -> bool:
    """
    Checks if vectorstore exists
    """
    if os.path.exists(os.path.join(persist_directory, 'index')):
        if os.path.exists(os.path.join(persist_directory, 'chroma-collections.parquet')) and os.path.exists(os.path.join(persist_directory, 'chroma-embeddings.parquet')):
            list_index_files = glob.glob(os.path.join(persist_directory, 'index/*.bin'))
            list_index_files += glob.glob(os.path.join(persist_directory, 'index/*.pkl'))
            # At least 3 documents are needed in a working vectorstore
            if len(list_index_files) > 3:
                return True
    return False

def main():
    # Create embeddings
    embeddings = HuggingFaceEmbeddings(model_name=embeddings_model_name)

    # Load and process documents
    documents = load_and_process_dataset()

    if does_vectorstore_exist(persist_directory):
        # Update and store locally vectorstore
        print(f"Appending to existing vectorstore at {persist_directory}")
        db = Chroma(persist_directory=persist_directory, embedding_function=embeddings, client_settings=CHROMA_SETTINGS)
        print(f"Creating embeddings. May take some minutes...")
        db.add_documents(documents)
    else:
        # Create and store locally vectorstore
        print("Creating new vectorstore")
        print(f"Creating embeddings. May take some minutes...")
        db = Chroma.from_documents(documents, embeddings, persist_directory=persist_directory, client_settings=CHROMA_SETTINGS)
    db.persist()
    db = None

    print(f"Ingestion complete! You can now run your RAG model to query your therapy dataset")

if __name__ == "__main__":
    main()