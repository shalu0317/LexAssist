import os
from dotenv import load_dotenv

load_dotenv()


GOOGLE_CLIENT_ID =  os.getenv("GOOGLE_CLIENT_ID")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM =  os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = 3600
BUCKET_NAME = os.getenv("BUCKET_NAME")

# Simple manual .env loader
def load_env(path=".env"):
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            key, value = line.split("=", 1)
            os.environ[key] = value

def get_api_key():
    # return os.environ.get("groq_api_key")
    return "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"