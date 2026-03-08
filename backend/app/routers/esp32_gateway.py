from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services import sensor_service, control_service

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {
            "mobile": None,
            "stationary": None,
        }

    async def connect(self, device_type: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[device_type] = websocket
        from app.services.state_store import global_state
        try:
            await websocket.send_json({"type": "state_sync", "actuators": global_state["actuators"]})
        except Exception as e:
            print(f"[WS] {device_type} state sync failed: {e}")
        print(f"[WS] {device_type} connected — actuator state synced")

    def disconnect(self, device_type: str):
        self.active_connections[device_type] = None
        print(f"[WS] {device_type} disconnected")

    async def send_command(self, target: str, data: dict) -> bool:
        ws = self.active_connections.get(target)
        if ws is None:
            return False
        try:
            await ws.send_json(data)
            return True
        except Exception as e:
            print(f"[WS] send_command error ({target}): {e}")
            self.disconnect(target)
            return False


manager = ConnectionManager()


# ── 1. Stationary gateway (pH, energy) ───────────────────────────────────────
@router.websocket("/ws/stationary")
async def ws_stationary(websocket: WebSocket):
    """WebSocket for stationary ESP32 (pH + energy hub)"""
    await manager.connect("stationary", websocket)
    try:
        while True:
            try:
                data = await websocket.receive_json()
            except Exception:
                print("[WS] Stationary: malformed message, skipping")
                continue
            await sensor_service.process_stationary_data(data)
    except WebSocketDisconnect:
        manager.disconnect("stationary")


# ── 2. Mobile gateway (temp, humidity, air, light, distance) ──────────────────
@router.websocket("/ws/mobile")
async def ws_mobile(websocket: WebSocket):
    """WebSocket for mobile ESP32 (robot with sensors)"""
    await manager.connect("mobile", websocket)
    try:
        while True:
            try:
                data = await websocket.receive_json()
            except Exception:
                print("[WS] Mobile: malformed message, skipping")
                continue
            await sensor_service.process_mobile_data(data)
    except WebSocketDisconnect:
        manager.disconnect("mobile")


# ── 3. Control commands ───────────────────────────────────────────────────────
@router.post("/api/control")
async def send_control_command(command: dict):
    """Send control command to ESP32 devices"""
    target = command.get("target")

    success = await control_service.process_command(command)
    if not success:
        return {"success": False, "error": "Invalid component"}

    sent = await manager.send_command(target, command)
    if sent:
        return {"success": True, "message": f"Command sent to {target}"}
    return {"success": False, "error": f"{target} device not connected"}


# ── 4. System state ───────────────────────────────────────────────────────────
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
        "stationary": manager.active_connections["stationary"] is not None,
    }
