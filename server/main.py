from fastapi import (
    FastAPI,
)
from configuration import SECRET_KEY, ALGORITHM, BUCKET_NAME
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import boto3
from fastapi.middleware.cors import CORSMiddleware
import bcrypt
from starlette.middleware import Middleware
from starlette.middleware.sessions import SessionMiddleware
from middleware.AuthGaurdMiddleware import AuthGuardMiddleware
from middleware.WebSocketAuthMiddleware import WebSocketAuthMiddleware
from api.user import router as user_router
from api.message import router as chat_router

ACCESS_TOKEN_EXPIRE_MINUTES = 3600
users_db = {
    "demo@example.com": {
        "email": "demo@example.com",
        "hashed_password": bcrypt.hashpw(b"demo123", bcrypt.gensalt()),
        "full_name": "Demo User",
    }
}

middleware = [
    Middleware(SessionMiddleware, 
        secret_key=SECRET_KEY,
        session_cookie="session",             # only for localhost
        https_only=False,
        max_age=60 * 60 * 24 * 7   ),
    Middleware(AuthGuardMiddleware),
    Middleware(WebSocketAuthMiddleware),
]

app = FastAPI(middleware=middleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    
)

# === Serve React build ===
# After you build React, set this to the "dist" (Vite) or "build" (CRA) folder
FRONTEND_DIR = (Path(__file__).parent.parent / "web" / "dist").resolve()
INDEX_FILE = FRONTEND_DIR / "index.html"

# Mount static files (JS/CSS/assets)
# All requests to /assets/... etc. will be served as files
app.mount("/assets", StaticFiles(directory=FRONTEND_DIR / "assets"), name="assets")

app.include_router(user_router, prefix="/user", tags=["User"])
app.include_router(chat_router, prefix="/secure/chat", tags=["Chat"])
# app.include_router(ws_router, prefix="/ws", tags=["WebSocket"])

# Serve index.html at root
@app.get("/", response_class=HTMLResponse)
async def root():
    return FileResponse(INDEX_FILE)


# Optional: SPA fallback so /route/foo also serves index.html
@app.get("/{full_path:path}", response_class=HTMLResponse)
async def spa_fallback(full_path: str):
    target = FRONTEND_DIR / full_path
    if target.exists() and target.is_file():
        # In case you have other top-level files
        return FileResponse(target)
    return FileResponse(INDEX_FILE)
