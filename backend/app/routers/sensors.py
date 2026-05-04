from fastapi import APIRouter
from app.services.state_store import global_state
from app.routers.esp32_gateway import manager
from app.services import control_service
from app.services.energy_prediction_service import get_energy_prediction
from app.services.sensor_repository import get_latest_sensor_readings, get_sensor_history

router = APIRouter()


@router.get("/api/sensors/all")
async def get_all_sensors():
    """Return the latest combined mobile and stationary sensor snapshot."""
    sensors = global_state["sensors"]
    devices = global_state["devices"]

    return {
        "mobile": {
            "connected": devices["mobile"]["connected"],
            "last_seen": devices["mobile"]["last_seen"],
            "temp": sensors["temp"],
            "humidity": sensors["hum"],
            "air_quality": sensors["air_quality"],
            "light": sensors["light"],
            "dist": sensors["dist"],
        },
        "stationary": {
            "connected": devices["stationary"]["connected"],
            "last_seen": devices["stationary"]["last_seen"],
            "ph": sensors["ph"],
            "energy_status": sensors["energy_status"],
            "voltage": sensors["energy_voltage"],
            "current": sensors["energy_current"],
            "power": sensors["energy_power"],
            "total_energy": sensors["energy_total"],
        },
    }


@router.get("/api/sensor/energy")
async def get_energy_snapshot():
    """Return the latest energy-monitor readings."""
    sensors = global_state["sensors"]
    stationary_connected = global_state["devices"]["stationary"]["connected"]

    return {
        "connected": stationary_connected,
        "status": sensors["energy_status"],
        "voltage": sensors["energy_voltage"],
        "current": sensors["energy_current"],
        "power": sensors["energy_power"],
        "total_energy": sensors["energy_total"],
        "prediction": get_energy_prediction(),
    }


@router.get("/api/sensors/latest")
async def get_latest_persisted_sensors():
    """Return the most recent MongoDB-backed readings for each device."""
    return await get_latest_sensor_readings()


@router.get("/api/sensors/history")
async def get_persisted_sensor_history(device_type: str | None = None, limit: int = 50):
    """Return sensor history from MongoDB."""
    normalized_device_type = device_type if device_type in {None, "mobile", "stationary"} else None
    safe_limit = max(1, min(limit, 200))
    return {
        "items": await get_sensor_history(device_type=normalized_device_type, limit=safe_limit),
        "device_type": normalized_device_type,
        "limit": safe_limit,
    }


@router.post("/api/actuator/pump")
async def control_pump(action: str):
    """Control water pump (ON/OFF)"""
    if action not in ["ON", "OFF"]:
        return {"success": False, "error": "Invalid action. Use ON or OFF"}

    command = {"target": "stationary", "component": "pump", "action": action}
    await control_service.process_command(command)
    sent = await manager.send_command("stationary", command)

    return {
        "success": sent,
        "component": "pump",
        "action": action,
        "message": "Command sent" if sent else "Device not connected",
    }


@router.post("/api/actuator/fan")
async def control_fan(action: str):
    """Control fan (ON/OFF)"""
    if action not in ["ON", "OFF"]:
        return {"success": False, "error": "Invalid action. Use ON or OFF"}

    command = {"target": "stationary", "component": "fan", "action": action}
    await control_service.process_command(command)
    sent = await manager.send_command("stationary", command)

    return {
        "success": sent,
        "component": "fan",
        "action": action,
        "message": "Command sent" if sent else "Device not connected",
    }


@router.post("/api/actuator/led_strip")
async def control_led_strip(action: str, brightness: int = 255):
    """Control LED strip (ON/OFF/SET_BRIGHTNESS)"""
    if action not in ["ON", "OFF", "SET_BRIGHTNESS"]:
        return {"success": False, "error": "Invalid action. Use ON, OFF, or SET_BRIGHTNESS"}

    command = {
        "target": "stationary",
        "component": "led_strip",
        "action": action,
        "value": brightness if action == "SET_BRIGHTNESS" else 0,
    }
    await control_service.process_command(command)
    sent = await manager.send_command("stationary", command)

    return {
        "success": sent,
        "component": "led_strip",
        "action": action,
        "brightness": brightness if action == "SET_BRIGHTNESS" else global_state["actuators"]["brightness"],
        "message": "Command sent" if sent else "Device not connected",
    }


@router.post("/api/actuator/rail")
async def control_rail(action: str):
    """Control mobile rail (MOVE_LEFT/MOVE_RIGHT/STOP)"""
    if action not in ["MOVE_LEFT", "MOVE_RIGHT", "STOP"]:
        return {"success": False, "error": "Invalid action. Use MOVE_LEFT, MOVE_RIGHT, or STOP"}

    # Rail is on the MOBILE device, not stationary
    command = {"target": "mobile", "component": "rail", "action": action}
    await control_service.process_command(command)
    sent = await manager.send_command("mobile", command)

    return {
        "success": sent,
        "component": "rail",
        "action": action,
        "message": "Command sent" if sent else "Device not connected",
    }


@router.post("/api/actuator/flash")
async def control_flash(action: str, brightness: int = 255):
    """Control ESP32-CAM flash (ON/OFF/SET_BRIGHTNESS)"""
    if action not in ["ON", "OFF", "SET_BRIGHTNESS"]:
        return {"success": False, "error": "Invalid action. Use ON, OFF, or SET_BRIGHTNESS"}

    command = {
        "target":    "camera",
        "component": "flash",
        "action":    action,
        "value":     brightness if action == "SET_BRIGHTNESS" else 0,
    }
    await control_service.process_command(command)
    sent = await manager.send_command("camera", command)

    return {
        "success":   sent,
        "component": "flash",
        "action":    action,
        "message":   "Command sent" if sent else "Camera not connected",
    }


@router.post("/api/priority")
async def set_priority(mode: str):
    """Set mobile device priority mode (camera | sensors | balanced).
    Sends SLEEP/WAKE commands to the mobile ESP32-CAM to manage shared 5V power."""
    if mode not in ["camera", "sensors", "balanced"]:
        return {"success": False, "error": "Invalid mode. Use camera, sensors, or balanced"}

    if mode == "camera":
        cam_cmd    = {"target": "mobile", "component": "camera", "action": "WAKE"}
        sensor_cmd = {"target": "mobile", "component": "mobile", "action": "SLEEP"}
    elif mode == "sensors":
        cam_cmd    = {"target": "mobile", "component": "camera", "action": "SLEEP"}
        sensor_cmd = {"target": "mobile", "component": "mobile", "action": "WAKE"}
    else:  # balanced
        cam_cmd    = {"target": "mobile", "component": "camera", "action": "WAKE"}
        sensor_cmd = {"target": "mobile", "component": "mobile", "action": "WAKE"}

    cam_sent    = await manager.send_command("mobile", cam_cmd)
    sensor_sent = await manager.send_command("mobile", sensor_cmd)
    sent = cam_sent and sensor_sent

    global_state["priority"] = mode

    return {
        "success": sent,
        "mode": mode,
        "message": f"Priority set to {mode}" if sent else "Mobile device not connected",
    }


@router.get("/api/actuators/status")
async def get_actuators_status():
    """Get current status of all actuators"""
    return global_state["actuators"]
