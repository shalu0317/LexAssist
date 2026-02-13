from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

class AuthGuardMiddleware(BaseHTTPMiddleware):

   
    async def dispatch(self, request, call_next):

        # Skip websocket routes
        if request.scope["type"] != "websocket" and request.url.path.startswith("/secure"):
            
            # ✅ IMPORTANT: Check session exists before accessing it
            if "session" not in request.scope:
                print("❌ Session not in request.scope")
                return JSONResponse({"detail": "Session middleware not loaded"}, status_code=500)

            user = request.session.get("user")
            print("🔍 Middleware sees user:", user)

            if not user:
                return JSONResponse({"detail": "Not authenticated"}, status_code=401)

        return await call_next(request)
