import os
import uuid
import requests
import tempfile
import redis
import traceback
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from embedding import EmbeddingManager
from vectorStore import VectorStore

# Initialize Redis
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

class IngestionService:
    def __init__(self):
        print("[IngestionService] Initializing models...")
        self.embedding_manager = EmbeddingManager()
        self.vector_store = VectorStore()
        
    def _download_file(self, url: str) -> str:
        """Downloads file from URL to a temporary path."""
        try:
            print(f"[Ingestion] Downloading from: {url}")
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            filename = url.split("/")[-1] or f"temp_{uuid.uuid4()}.pdf"
            if not filename.endswith(".pdf"):
                filename += ".pdf"
                
            temp_dir = tempfile.gettempdir()
            file_path = os.path.join(temp_dir, filename)
            
            with open(file_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            return file_path
        except Exception as e:
            print(f"[Ingestion] Download Error: {e}")
            raise e

    def process_and_ingest(self, file_url: str, thread_id: str):
        """
        Ingests file against a specific THREAD_ID.
        """
        temp_path = None
        try:
            # 1. Download
            temp_path = self._download_file(file_url)
            filename = os.path.basename(temp_path)

            # 2. Load & Split
            loader = PyPDFLoader(temp_path)
            raw_docs = loader.load()
            
            if not raw_docs:
                print("[Ingestion] Warning: PDF was empty.")
                return

            text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
            chunks = text_splitter.split_documents(raw_docs)
            print(f"[Ingestion] Created {len(chunks)} chunks for Thread {thread_id}")

            # 3. Embed
            texts = [c.page_content for c in chunks]
            metadatas = [c.metadata for c in chunks]
            
            embeddings = self.embedding_manager.generate_embeddings(texts)
            
            vectors_to_upload = []
            for i, text in enumerate(texts):
                meta = metadatas[i]
                meta["user"] = thread_id   
                meta["thread_id"] = thread_id 
                meta["text"] = text       
                meta["filename"] = filename
                meta["source"] = file_url 

                vectors_to_upload.append({
                    "key": str(uuid.uuid4()),
                    "data": {"float32": embeddings[i].tolist()},
                    "metadata": meta
                })

            # 4. Upload to S3
            print(f"[Ingestion] Uploading {len(vectors_to_upload)} vectors...")
            self.vector_store.s3vectors.put_vectors(
                vectorBucketName=self.vector_store.bucket_name,
                indexName="file-upload-index",
                vectors=vectors_to_upload
            )

            # 5. Update Redis Manifest
            preview_text = raw_docs[0].page_content[:600].replace("\n", " ")
            new_manifest_entry = f"FILENAME: {filename}\nPREVIEW: {preview_text}\nSOURCE_URL: {file_url}\n\n"
            
            redis_key = f"manifest:{thread_id}"
            
            # Append to existing manifest if user uploads multiple files in one thread
            existing_manifest = redis_client.get(redis_key) or ""
            updated_manifest = existing_manifest + new_manifest_entry
            
            # redis_client.setex(redis_key, 86400, updated_manifest) # 24hr TTL
            print(f"[Ingestion] Redis Manifest updated for: {redis_key}")

        except Exception as e:
            print(f"[Ingestion] Error: {traceback.format_exc()}")
            raise e
        finally:
            if temp_path and os.path.exists(temp_path):
                os.remove(temp_path)

# --- Usage Example ---
if __name__ == "__main__":
    service = IngestionService()
    
    # Simulate a call
    test_url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    test_thread = "session_abc_123"
    
    service.process_and_ingest(file_url=test_url, thread_id=test_thread)