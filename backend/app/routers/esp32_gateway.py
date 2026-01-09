from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request, Response
from fastapi.responses import StreamingResponse
from app.services import sensor_service, image_service, control_service
import asyncio

router = APIRouter()

# Store active connections to send commands back later
class ConnectionManager:
    def __init__(self):
        self.active_connections = {
            "mobile": None,
            "stationary": None
        }

    async def connect(self, device_type: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[device_type] = websocket
        print(f"✅ {device_type} Connected")

    def disconnect(self, device_type: str):
        self.active_connections[device_type] = None
        print(f"❌ {device_type} Disconnected")

    async def send_command(self, target: str, data: dict):
        ws = self.active_connections.get(target)
        if ws:
            await ws.send_json(data)
            return True
        return False

manager = ConnectionManager()

# --- 1. STATIONARY GATEWAY (Pumps, pH) ---
@router.websocket("/ws/stationary")
async def ws_stationary(websocket: WebSocket):
    """WebSocket for stationary ESP32 (sensor hub)"""
    await manager.connect("stationary", websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # Fan-Out to Service
            await sensor_service.process_stationary_data(data)
    except WebSocketDisconnect:
        manager.disconnect("stationary")

# --- 2. MOBILE GATEWAY (Temp, Gas, Distance) ---
@router.websocket("/ws/mobile")
async def ws_mobile(websocket: WebSocket):
    """WebSocket for mobile ESP32 (robot with camera)"""
    await manager.connect("mobile", websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # Fan-Out to Service
            await sensor_service.process_mobile_data(data)
    except WebSocketDisconnect:
        manager.disconnect("mobile")

# --- 3. IMAGE GATEWAY ---
@router.post("/api/upload-frame")
async def upload_frame(request: Request):
    """Receive RGB565 frame from ESP32-CAM"""
    body = await request.body()
    # Fan-Out to Image Service
    success = await image_service.process_frame(body, format_type="rgb565")
    
    if success:
        return Response(status_code=200)
    else:
        return Response(status_code=400)

# --- 4. VIDEO FEED ---
async def generate_video():
    """Generate video stream from frames"""
    while True:
        frame = image_service.get_current_frame()
        if frame:
            yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        await asyncio.sleep(0.05)

@router.get("/video_feed")
async def video_feed():
    """Stream processed video feed"""
    return StreamingResponse(
        generate_video(), 
        media_type="multipart/x-mixed-replace; boundary=frame"
    )
