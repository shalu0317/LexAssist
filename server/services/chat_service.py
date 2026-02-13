from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import glob
import uuid
import redis

# LangChain Imports
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Pipeline Imports
from services.pipeline_graph import rag_app
from services.embedding import EmbeddingManager
from services.vectorStore import VectorStore

import boto3
from botocore.exceptions import ClientError
from urllib.parse import unquote

app = FastAPI(title="Legal RAG API with Redis State Management")

# Initialize Globals
embedding_manager = EmbeddingManager()
vector_store = VectorStore()
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
s3_client = boto3.client('s3')

# --- 1. REDIS STATE MANAGER ---
class RedisStateManager:
    def __init__(self, thread_id: str):
        self.thread_id = thread_id
        self.key = f"rag_session:{thread_id}"

    def get_state(self):
        data = redis_client.hgetall(self.key)
        return {
            "conversation_summary": data.get("conversation_summary", ""),
            "file_manifest": data.get("file_manifest", ""),
            "file_path": data.get("file_path", "")
        }

    def update_manifest(self, new_manifest: str, file_path: str):
        # Append new manifest to keep history of all uploaded files in session
        current_manifest = redis_client.hget(self.key, "file_manifest") or ""

        try:
            filename_line = new_manifest.split('\n')[0] 
            filename = filename_line.split(": ")[1].strip()
            
            if filename in current_manifest:
                print(f">>> [State] Manifest for '{filename}' already exists. Skipping append.")
                return # Do nothing
        except:
            pass # If parsing fails, just append to be safe

        # prevent duplicate manifest entries if possible, otherwise just append
        updated_manifest = current_manifest + "\n\n" + new_manifest
        
        redis_client.hset(self.key, mapping={
            "file_manifest": updated_manifest.strip(),
            "file_path": file_path
        })

    def update_summary(self, new_summary: str):
        redis_client.hset(self.key, "conversation_summary", new_summary)

# --- 2. DATA MODELS ---
class IngestRequest(BaseModel):
    thread_id: str
    file_name: str  

class QueryRequest(BaseModel):
    thread_id: str
    question: str
    ingest_files: bool = False

def download_file_from_s3(filename: str) -> str:
    """
    Downloads a file directly from S3 using Boto3 to a temporary path.
    
    Args:
        filename (str): The S3 Key 
        
    Returns:
        str: The local path to the downloaded temporary file.
    """
    tmp_path = None
    BUCKET_NAME = "txitaxlawcases"
    try:
        # 1. DECODE THE KEY
        s3_key = unquote(filename)

        actual_filename = os.path.basename(s3_key)
        
        # Join with current working directory
        local_path = os.path.join(os.getcwd(), actual_filename)

        print(f">>> [S3] Downloading Key: '{s3_key}'...")
        print(f">>> [S3] Target Path: '{local_path}'")
        
        s3_client.download_file(BUCKET_NAME, s3_key, local_path)
        
        print(f">>> [S3] Download successful. Saved to: {local_path}")
        return local_path

    except ClientError as e:
        print(f"!!! AWS ClientError: {e}")
        # Clean up empty file if download failed
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path) 
        raise e
        
    except Exception as e:
        print(f"!!! Unexpected Error: {e}")
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise e
    

def run_ingestion_task(thread_id: str, file_url: str):
    print(f"\n>>> [Ingest Task] Started for Thread: {thread_id}")
    
    # 1. Download
    try:
        temp_path = download_file_from_s3(file_url)
        original_name = file_url.split("/")[-1].split("?")[0]
    except Exception as e:
        print(f"!!! Download Failed: {e}")
        return

    try:
        # 2. Vectorize (Add to Brain)
        loader = PyPDFLoader(temp_path)
        docs = loader.load()
        
        # Tag vectors with S3 URL so citations work later
        for d in docs:
            d.metadata["source"] = file_url
            d.metadata["filename"] = original_name
            d.metadata["thread_id"] = thread_id # Critical for isolation
        
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
        chunks = text_splitter.split_documents(docs)
        
        if chunks:
            texts = [c.page_content for c in chunks]
            metadatas = [c.metadata for c in chunks]
            embeddings = embedding_manager.generate_embeddings(texts)
            
            vectors = []
            for i, text in enumerate(texts):
                vectors.append({
                    "key": str(uuid.uuid4()),
                    "data": {"float32": embeddings[i].tolist()},
                    "metadata": {**metadatas[i], "text": text, "user": thread_id}
                })
            
            vector_store.s3vectors.put_vectors(
                vectorBucketName=vector_store.bucket_name,
                indexName="file-upload-index",
                vectors=vectors
            )
            print(f">>> [Ingest Task] Uploaded {len(vectors)} vectors.")
        
        # 3. Build Manifest (For Router)
        loader_manifest = PyPDFLoader(temp_path)
        docs_manifest = loader_manifest.load_and_split()
        if docs_manifest:
            preview = docs_manifest[0].page_content[:1000].replace("\n", " ")
            new_manifest_entry = f"FILENAME: {original_name}\nPREVIEW: {preview}\n\n"
            
            # Update Redis
            key = f"rag_session:{thread_id}"
            current_manifest = redis_client.hget(key, "file_manifest") or ""
            
            # Simple dedup
            if original_name not in current_manifest:
                updated_manifest = (current_manifest + "\n\n" + new_manifest_entry).strip()
                redis_client.hset(key, "file_manifest", updated_manifest)
                print(f">>> [Ingest Task] Redis Manifest Updated.")
            else:
                print(f">>> [Ingest Task] Manifest already exists. Skipping.")

    except Exception as e:
        print(f"!!! Ingestion Failed: {e}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

def ingest_files_endpoint(request: IngestRequest):
    """
    Called immediately after S3 upload.
    Uses BackgroundTasks so the UI doesn't hang.
    """
    if not request.file_name:
        raise HTTPException(status_code=400, detail="No file_path provided")
    
    # Run the heavy logic in background
    # background_tasks.add_task(run_ingestion_task, request.thread_id, request.file_path)
    run_ingestion_task(request.thread_id, request.file_name)
    
    return {"status": "processing_started", "message": "Ingestion running in background"}

async def query_pipeline(request: QueryRequest):
    print(f"\n{'='*40}")
    print(f">>> API REQUEST | Thread: {request.thread_id}")
    
# 1. FETCH STATE (Populated by /ingest)
    key = f"rag_session:{request.thread_id}"
    state_data = redis_client.hgetall(key)
    
    conversation_summary = state_data.get("conversation_summary", "")
    file_manifest = state_data.get("file_manifest", "")
    
    print(f">>> [Context] Manifest Len: {len(file_manifest)}")
    

    inputs = {
        "question": request.question,
        "conversation_summary": conversation_summary,
        "file_manifest": file_manifest, 
        "thread_id": request.thread_id
    }
    
    # 4. RUN PIPELINE
    try:
        final_state = rag_app.invoke(inputs)
        
        # 4. UPDATE HISTORY
        redis_client.hset(key, "conversation_summary", final_state["updated_summary"])
        
        source_paths = []
        if final_state.get("source_metadata"):
            source_paths = list(set([s.get('full_path', 'unknown') for s in final_state["source_metadata"]]))
        
        return {
            "answer": final_state["final_answer"],
            "sources": source_paths,
            "title": final_state["chat_title"],
            "summary": final_state["updated_summary"],
            "follow_up": final_state["follow_up"]
        }
        
    except Exception as e:
        print(f"!!! PIPELINE ERROR: {e}")
        return str(e)