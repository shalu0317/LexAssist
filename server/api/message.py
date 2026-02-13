from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request
from starlette.requests import Request as starletteRequest
from configuration import BUCKET_NAME
import asyncio
import json
import boto3
import hashlib
from services.chat_service import QueryRequest, query_pipeline, IngestRequest, ingest_files_endpoint
from collections import defaultdict

router = APIRouter()


s3_client = boto3.client("s3", region_name="ap-south-1")


def sha256_hash(value: str):
    return hashlib.sha256(value.encode()).hexdigest()


class ConnectionManager:
    def __init__(self):
        self.active: set[WebSocket] = set()
        self.rooms = defaultdict(list)

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.add(ws)
        
    def join_room(self, thread_id: str, ws: WebSocket):
        if ws not in self.rooms[thread_id]:
            print(f"joining the room {self.rooms[thread_id]}")
            self.rooms[thread_id].append(ws)
            
    def leave_all(self, ws: WebSocket):
        for room in self.rooms.values():
            if ws in room:
                room.remove(ws)

    async def send_to_room(self, thread_id: str, message: dict):
        for client in self.rooms.get(thread_id, []):
            await client.send_text(json.dumps(message))

    def disconnect(self, ws: WebSocket):
        self.active.discard(ws)
        self.leave_all(ws)

    async def broadcast(self, data: str):
        coros = []
        for ws in list(self.active):
            try:
                coros.append(ws.send_text(data))
            except Exception:
                # skip dead sockets
                self.disconnect(ws)
        if coros:
            await asyncio.gather(*coros, return_exceptions=True)


manager = ConnectionManager()


@router.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:

            data = await ws.receive_text()

            session = ws.scope.get("session")

            if not session or "user" not in session:
                await ws.close(code=1008)
                return

            user = session["user"]

            print(f"user ${user}")

            combined = f"{user["email"]}:{user["sub"]}"
            hash_path = sha256_hash(combined)

            print(f"user data is ${hash_path}")

            obj = json.loads(data)

            thread_id = f"{hash_path}:{obj["thread_id"]}"
            manager.join_room(thread_id, ws)
            
            question = obj["content"]
            ingest_files = obj["isFileUploaded"]
            print(f"thread_id {thread_id} ingest_files {ingest_files}")

            query = QueryRequest(
                thread_id=thread_id,
                question=question,
                ingest_files=ingest_files,
            )

            response = await query_pipeline(query)
            # summary = response.get("summary")
            print(f"response is {response}")
            
            

            long_text = response.get("answer", "No answer found")
            title = response.get("title", "No title found")
            # long_text = "Hello!!!!!!!"
            manager.join_room(thread_id, ws)
            print(f"long response is {long_text}")
            for i in range(0, len(long_text), 10):  # chunk size = 50 chars
                await manager.send_to_room(
                    thread_id=thread_id,
                    message=json.dumps(
                        {   
                            "thread_id": obj["thread_id"],
                            "type": "stream",
                            "content": long_text[i : i + 10],
                            "summary": "",
                            "title": title,
                        }
                    )
                )
                await asyncio.sleep(0.05)  # simulate streaming

            if response.get("sources"):
                await manager.send_to_room(
                    thread_id=thread_id,
                    message={ "thread_id": obj["thread_id"], "type": "source", "sources": response.get("sources")}
                )
                print("Final JSON sent.")
            else:
                print("No valid JSON to send, skipping.")

            await manager.send_to_room(
                thread_id=thread_id,
                message=json.dumps({ "thread_id": obj["thread_id"], "type": "stream","content": "__END__", "summary": "", "title": title})
            )

    except WebSocketDisconnect:
        manager.disconnect(ws)
        print("disconnecting socket")
        manager.leave_all(ws)


@router.get("/get-presigned-url")
def get_presigned_url(filename: str):
    url = s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": BUCKET_NAME, "Key": filename},
        ExpiresIn=3600,  # URL valid for 1 hour
    )
    print(f"url is ")
    return {"url": url}


@router.get("/get-presigned-url-for-upload")
def get_presigned_url(
    filename: str, filetype: str, conversation_id: str, request: Request
):
    userData = request.session.get("user")
    token = request.cookies.get("session")

    print(f"token is ${token}")
    # jwt_token = create_jwt(userData["email"], token)
    # print(f"jwt_token is ${jwt_token}")

    # 2️⃣ Hash the JWT → This becomes S3 folder path
    combined = f"{userData["email"]}:{userData["sub"]}"
    hash_path = sha256_hash(combined)
    print(f"user data is ${hash_path}")

    # Final S3 Key →   <hash>/<filename>
    s3_key = f"{hash_path}/{filename}"

    thread_id = f"{hash_path}:{conversation_id}"
    file_path = s3_key
    
  
    url = s3_client.generate_presigned_url(
        ClientMethod="put_object",
        Params={"Bucket": BUCKET_NAME, "Key": s3_key, "ContentType": filetype},
        ExpiresIn=3600,  # URL valid for 1 hour
    )
    
    ingestReq = IngestRequest(thread_id=thread_id, file_name=file_path)
    print(f"ingest {ingestReq}")
    response = ingest_files_endpoint(ingestReq)
    
    print(response)
    
    return {"uploadURL": url, "file_path": file_path}
