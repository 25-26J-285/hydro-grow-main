from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request, Response
from fastapi.responses import StreamingResponse
from app.services import sensor_service, image_service, control_service, scan_service, mock_scan_service, mock_sensor_service
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

# --- 5. CONTROL COMMANDS ---
@router.post("/api/control")
async def send_control_command(command: dict):
    """Send control command to ESP32 devices"""
    target = command.get("target")  # "mobile" or "stationary"
    
    # Process the command
    success = await control_service.process_command(command)
    
    if not success:
        return {"success": False, "error": "Invalid component"}
    
    # Send command to the device via WebSocket
    sent = await manager.send_command(target, command)
    
    if sent:
        return {"success": True, "message": f"Command sent to {target}"}
    else:
        return {"success": False, "error": f"{target} device not connected"}

@router.get("/api/state")
async def get_system_state():
    """Get current system state"""
    from app.services.state_store import global_state
    return global_state

@router.get("/api/devices/status")
async def get_devices_status():
    """Check which devices are connected"""
    return {
        "mobile": manager.active_connections["mobile"] is not None,
        "stationary": manager.active_connections["stationary"] is not None
    }

# --- 6. SHELF SCANNING ---
@router.post("/api/scan/start")
async def start_scan():
    """
    Start automated shelf scanning
    Moves mobile ESP32-CAM from top-right to bottom-left
    Captures and analyzes images at each position
    """
    async def send_command_wrapper(command: dict):
        """Wrapper to send commands via WebSocket"""
        await control_service.process_command(command)
        return await manager.send_command(command["target"], command)
    
    # Start scan in background task
    result = await scan_service.start_shelf_scan(send_command_wrapper)
    return result

@router.get("/api/scan/status")
async def get_scan_status():
    """Get current scan progress"""
    return scan_service.get_scan_status()

@router.post("/api/scan/stop")
async def stop_scan():
    """Stop ongoing scan"""
    return scan_service.stop_scan()

# --- 7. MOCK SCANNING (For Testing Without ESP32) ---
@router.post("/api/scan/mock")
async def start_mock_scan():
    """
    Start simulated shelf scanning for testing
    No ESP32 hardware required - generates random plant detections
    """
    result = await mock_scan_service.simulate_shelf_scan()
    return result

@router.get("/api/scan/mock/status")
async def get_mock_scan_status():
    """Get current mock scan progress"""
    return mock_scan_service.get_mock_scan_status()

# --- 8. MOCK SENSORS (For Testing Without ESP32) ---
@router.post("/api/sensors/mock/start")
async def start_mock_sensors(update_interval: float = 2.0):
    """
    Start generating mock sensor data continuously
    No ESP32 hardware required - simulates realistic sensor readings
    
    Args:
        update_interval: Seconds between updates (default: 2.0)
    """
    result = await mock_sensor_service.start_mock_sensors(update_interval)
    return result

@router.post("/api/sensors/mock/stop")
async def stop_mock_sensors():
    """Stop generating mock sensor data"""
    result = await mock_sensor_service.stop_mock_sensors()
    return result

@router.get("/api/sensors/mock/status")
async def get_mock_sensors_status():
    """Get current status of mock sensor simulation"""
    return mock_sensor_service.get_mock_sensor_status()

@router.get("/api/sensors/mock/snapshot")
async def get_mock_snapshot():
    """
    Generate a single snapshot of all sensor data
    Useful for one-time testing without continuous simulation
    """
    return mock_sensor_service.generate_single_snapshot()
