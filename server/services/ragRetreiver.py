from services.embedding import EmbeddingManager
from services.vectorStore import VectorStore
from typing import List, Dict, Any

class RAGRetriever:
    """Handles Dual-Path retrieval."""

    def __init__(self, vector_store: VectorStore, embedding_manager: EmbeddingManager):
        self.vector_store = vector_store
        self.embedding_manager = embedding_manager

    def retrieve_split(self, file_queries: List[str], case_queries: List[str], thread_id: str, top_k: int = 10) -> Dict[str, List[Any]]:
        results = {"files": [], "cases": []}
        
        # --- 1. PROCESS FILES (Loop through ALL queries) ---
        if file_queries:
            print(f"   [RAGRetriever] Executing {len(file_queries)} File Queries...")
            unique_files = {} # Dict for deduplication
            
            for q in file_queries:
                # Embed and Search for EACH query
                q_emb = self.embedding_manager.generate_embeddings([q])[0]
                
                raw_files = self.vector_store.search_private_files(
                    query_vector=q_emb.astype("float32").tolist(), 
                    user_id=thread_id,
                    k=top_k
                )
                
                # Deduplicate by text content or filename
                for doc in raw_files:
                    # Use a unique key (filename + chunk index if available, or just text hash)
                    doc_key = doc.get("metadata", {}).get("text", "")[:50] 
                    if doc_key and doc_key not in unique_files:
                        unique_files[doc_key] = doc
            
            results["files"] = list(unique_files.values())
            print(f"   [RAGRetriever] Found {len(results['files'])} unique file chunks.")

        # --- 2. PROCESS CASES (Loop through ALL queries) ---
        if case_queries:
            print(f"   [RAGRetriever] Executing {len(case_queries)} Case Queries...")
            unique_cases = {}
            
            for q in case_queries:
                q_emb = self.embedding_manager.generate_embeddings([q])[0]
                
                raw_cases = self.vector_store.search_public_cases(
                    query_vector=q_emb.astype("float32").tolist(), 
                    k=top_k
                )
                
                for doc in raw_cases:
                    # Deduplicate cases
                    doc_key = doc.get("metadata", {}).get("case_about_detailed", "")[:50]
                    if doc_key and doc_key not in unique_cases:
                        unique_cases[doc_key] = doc

            results["cases"] = list(unique_cases.values())
            print(f"   [RAGRetriever] Found {len(results['cases'])} unique cases.")
            
        return results