from dotevn import load_dotenv
import os

load_dotenv()  # Load environment variables from .env file

def get_api_key():
    return os.getenv("groq_api_key")