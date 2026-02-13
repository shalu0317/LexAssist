import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List

class EmbeddingManager:
    """Handles document embedding generation using SentenceTransformer."""

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = None
        self._load_model()

    def _load_model(self):
        try:
            print(f"[EmbeddingManager] Loading model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            print("[EmbeddingManager] Model loaded successfully.")
        except Exception as e:
            print(f"[EmbeddingManager] Error loading model: {e}")
            raise

    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        if not self.model:
            raise ValueError("Model not loaded")

        print(f"[EmbeddingManager] Generating embeddings for {len(texts)} text input(s)...")
        embeddings = self.model.encode(texts, show_progress_bar=False)
        return embeddings