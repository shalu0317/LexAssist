import boto3
from typing import List, Dict, Any
import traceback

class VectorStore:
    """Manages document embeddings in vector store (AWS S3-based)."""

    def __init__(self, collection_name: str = "pdf_doucments"):
        self.region = "us-east-1"
        self.bucket_name = "vectorbuckettechxi"
        # We now manage two conceptual indexes (mapped to s3-vector-index and file-upload-index)
        self.s3vectors = boto3.client("s3vectors", region_name=self.region)

    # --- PATH A: PRIVATE FILES ---
    def search_private_files(self, query_vector: List[float], user_id: str, k: int = 5) -> List[Dict[str, Any]]:
        try:
            print(f"   [VectorStore] Searching PRIVATE FILES...")
            response = self.s3vectors.query_vectors(
                vectorBucketName=self.bucket_name,
                indexName="file-upload-index", # Explicit Index Name
                queryVector={"float32": query_vector},
                topK=k,
                filter={'user': {'$in': [user_id]}}, # STRICT SECURITY FILTER
                returnMetadata=True
            )
            return response.get("vectors", [])
        except Exception as e:
            print(f"[VectorStore] File Search Error: {e}")
            return []

    # --- PATH B: PUBLIC CASES ---
    def search_public_cases(self, query_vector: List[float], k: int = 5) -> List[Dict[str, Any]]:
        try:
            print(f"   [VectorStore] Searching PUBLIC CASES...")
            response = self.s3vectors.query_vectors(
                vectorBucketName=self.bucket_name,
                indexName="s3-vector-index", # Explicit Index Name
                queryVector={"float32": query_vector},
                topK=k,
                returnMetadata=True
            )
            return response.get("vectors", [])
        except Exception as e:
            print(f"[VectorStore] Case Search Error: {e}")
            return []