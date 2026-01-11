from fastapi import APIRouter
from app.services.state_store import global_state
from app.routers.esp32_gateway import manager
from app.services import control_service

router = APIRouter()

# Actuator control endpoints
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
        "message": "Command sent" if sent else "Device not connected"
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
        "message": "Command sent" if sent else "Device not connected"
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
        "value": brightness if action == "SET_BRIGHTNESS" else 0
    }
    
    await control_service.process_command(command)
    sent = await manager.send_command("stationary", command)
    
    return {
        "success": sent,
        "component": "led_strip",
        "action": action,
        "brightness": brightness if action == "SET_BRIGHTNESS" else global_state["actuators"]["brightness"],
        "message": "Command sent" if sent else "Device not connected"
    }

@router.post("/api/actuator/rail")
async def control_rail(action: str):
    """Control mobile rail (MOVE_LEFT/MOVE_RIGHT/STOP)"""
    if action not in ["MOVE_LEFT", "MOVE_RIGHT", "STOP"]:
        return {"success": False, "error": "Invalid action. Use MOVE_LEFT, MOVE_RIGHT, or STOP"}
    
    command = {"target": "stationary", "component": "rail", "action": action}
    await control_service.process_command(command)
    sent = await manager.send_command("stationary", command)
    
    return {
        "success": sent,
        "component": "rail",
        "action": action,
        "message": "Command sent" if sent else "Device not connected"
    }

@router.get("/api/actuators/status")
async def get_actuators_status():
    """Get current status of all actuators"""
    return global_state["actuators"]
