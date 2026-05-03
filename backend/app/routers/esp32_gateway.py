import asyncio
import json
from datetime import datetime

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services import control_service, image_service, sensor_service

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {
            "mobile": None,
            "stationary": None,
            "camera": None,
        }
        # Per-device send lock prevents concurrent sends from corrupting a WS stream.
        self._send_locks: dict = {
            "mobile": asyncio.Lock(),
            "stationary": asyncio.Lock(),
            "camera": asyncio.Lock(),
        }

    async def connect(self, device_type: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[device_type] = websocket

        from app.services.state_store import global_state

        if device_type == "camera":
            sync_payload = {
                "type": "state_sync",
                "actuators": {
                    "flash": global_state["actuators"]["flash"],
                    "flash_brightness": global_state["actuators"]["flash_brightness"],
                },
            }
        else:
            sync_payload = {"type": "state_sync", "actuators": global_state["actuators"]}

        try:
            async with self._send_locks[device_type]:
                await websocket.send_json(sync_payload)
        except Exception as e:
            print(f"[WS] {device_type} state sync failed: {e}")

        print(f"[WS] {device_type} connected - actuator state synced")

    def disconnect(self, device_type: str):
        self.active_connections[device_type] = None
        print(f"[WS] {device_type} disconnected")

    async def send_command(self, target: str, data: dict) -> bool:
        ws = self.active_connections.get(target)
        if ws is None:
            return False

        try:
            async with self._send_locks[target]:
                await ws.send_json(data)
            return True
        except Exception as e:
            print(f"[WS] send_command error ({target}): {e}")
            self.disconnect(target)
            return False


manager = ConnectionManager()


@router.websocket("/ws/stationary")
async def ws_stationary(websocket: WebSocket):
    """WebSocket for the main ESP32 DevKit controller (sensors + relays + motion)."""
    await manager.connect("stationary", websocket)
    try:
        while True:
            try:
                data = await websocket.receive_json()
            except WebSocketDisconnect:
                raise
            except Exception:
                print("[WS] Stationary: malformed message, skipping")
                continue
            await sensor_service.process_stationary_data(data)
    except WebSocketDisconnect:
        manager.disconnect("stationary")


@router.websocket("/ws/mobile-sensors")
async def ws_mobile(websocket: WebSocket):
    """Optional WebSocket for a separate mobile sensor ESP32."""
    await manager.connect("mobile", websocket)
    try:
        while True:
            try:
                data = await websocket.receive_json()
            except WebSocketDisconnect:
                raise
            except Exception:
                print("[WS] Mobile: malformed message, skipping")
                continue
            await sensor_service.process_mobile_data(data)
    except WebSocketDisconnect:
        manager.disconnect("mobile")


@router.websocket("/ws/camera")
async def ws_camera(websocket: WebSocket):
    """WebSocket for ESP32-CAM (binary RGB565 frames + JSON heartbeat)."""
    from app.services.state_store import global_state

    await manager.connect("camera", websocket)
    try:
        while True:
            try:
                message = await websocket.receive()
                if "bytes" in message and message["bytes"]:
                    await image_service.process_frame(message["bytes"], format_type="rgb565")
                elif "text" in message and message["text"]:
                    data = json.loads(message["text"])
                    global_state["devices"]["camera"]["connected"] = True
                    global_state["devices"]["camera"]["last_seen"] = datetime.now().isoformat()
                    print(f"[Camera] Heartbeat - heap:{data.get('heap')}")
            except Exception:
                continue
    except WebSocketDisconnect:
        global_state["devices"]["camera"]["connected"] = False
        manager.disconnect("camera")


@router.post("/api/control")
async def send_control_command(command: dict):
    """Send control command to ESP32 devices."""
    target = command.get("target")

    success = await control_service.process_command(command)
    if not success:
        return {"success": False, "error": "Invalid component"}

    sent = await manager.send_command(target, command)
    if sent:
        return {"success": True, "message": f"Command sent to {target}"}
    return {"success": False, "error": f"{target} device not connected"}


@router.get("/api/state")
async def get_system_state():
    """Get current system state."""
    from app.services.state_store import global_state

    return global_state


@router.get("/api/devices/status")
async def get_devices_status():
    """Check which devices are connected."""
    return {
        "mobile": manager.active_connections["mobile"] is not None,
        "stationary": manager.active_connections["stationary"] is not None,
        "camera": manager.active_connections["camera"] is not None,
    }
