from starlette.types import ASGIApp, Scope, Receive, Send
from starlette.websockets import WebSocket
from starlette.responses import JSONResponse


class WebSocketAuthMiddleware:

    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send):

        
        # Only handle WebSocket connections
        if scope["type"] == "websocket":

            ws = WebSocket(scope, receive=receive, send=send)

            print(f"web socket is ${ws.session}")
            # # 🔐 Read session cookie
            user = ws.session.get("user")
            # print("🔍 Middleware sees user:", user)

            if not user:
                return JSONResponse({"detail": "Not authenticated"}, status_code=401)

        # Continue to next middleware / app
        await self.app(scope, receive, send)
