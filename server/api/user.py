from fastapi import (
    APIRouter, 
    Response, 
    Request,
    HTTPException
)
import requests
import bcrypt
from datetime import datetime, timedelta
from jose import jwt
from configuration import SECRET_KEY, ALGORITHM
from fastapi.responses import JSONResponse  
from pydantic import BaseModel
import uuid

router = APIRouter()

ACCESS_TOKEN_EXPIRE_MINUTES = 3600
users_db = {
    "demo@example.com": {
        "email": "demo@example.com",
        "hashed_password": bcrypt.hashpw(b"demo123", bcrypt.gensalt()),
        "full_name": "Demo User",
    }
}


def verify_password(plain, hashed):
    return bcrypt.checkpw(plain.encode(), hashed)


def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode.update(
        {"exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)}
    )
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def getUserInfo(token):
    response = requests.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {token}"},
    )
    return response


def create_jwt(google_id: str, email: str, session_token: str):
    payload = {
        "google_id": google_id,
        "email": email,
        "session_token": session_token,
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_jwt(token: str):
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return decoded
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    

class LoginRequest(BaseModel):
    username: str
    password: str
    
@router.post("/login")
def login(req: LoginRequest):
    user = users_db.get(req.username)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if not verify_password(req.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token({"sub": user["email"]})

    return {"access_token": token, "token_type": "bearer"}

@router.post("/logout")
def logout(request: Request, response: Response):
    request.session.clear()
    response.delete_cookie("session")
    return {"message": "Logged out successfully"}

class GoogleToken(BaseModel):
    token: str
    
# ----------------------------
# Google Login Endpoint
# ----------------------------

@router.post("/google-login")
def google_login(req: GoogleToken, request: Request):
    try:
        response = getUserInfo(req.token)

        # info = id_token.verify_oauth2_token(req.token, requests.Request())
        # print(f"info is ${info}")
        if response.status_code == 200:
            user_info = response.json()
            print("✅ User info fetched successfully:")
            google_id = user_info["sub"]
            email = user_info["email"]
            name = user_info.get("name")

            # 1️⃣ Create your own internal session token
            session_token = uuid.uuid4().hex

            # 2️⃣ Create your own JWT (that browser can't modify)
            jwt_token = create_jwt(google_id, email, session_token)

            print("✅ jwt_token:", jwt_token)

            request.session["user"] = user_info
            print(user_info)
            response = JSONResponse({
                "message": "Login successful",
                "user": user_info
            })

            response.set_cookie(
                key="session",
                value=jwt_token,
                httponly=False,
                secure=False,
                expires=60*60*24*7
            )

            return response
        else:
            print("❌ Failed to fetch user info")
            print("Status Code:", response.status_code)
            print("Response:", response.text)

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")

@router.get("/info")
def user_info(request: Request):
    print(f"🍪 Incoming Cookies: ${request.cookies}")
    return  request.session.get("user")

