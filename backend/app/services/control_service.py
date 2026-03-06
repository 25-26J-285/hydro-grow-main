from app.services.state_store import global_state

async def process_command(command: dict):
    """Process control command and update state"""
    component = command.get("component")
    action = command.get("action")
    value = command.get("value", 0)
    
    # Handle LED brightness control
    if component == "led_strip":
        global_state["actuators"]["led_strip"] = action
        if action == "SET_BRIGHTNESS":
            global_state["actuators"]["brightness"] = min(max(value, 0), 255)
            print(f"[CMD] Command: {component} -> {action} (Brightness: {value})")
        else:
            if action == "OFF":
                global_state["actuators"]["brightness"] = 0
            elif action == "ON":
                global_state["actuators"]["brightness"] = 255
            print(f"[CMD] Command: {component} -> {action}")
        return True
    
    # Handle other actuators
    if component in global_state["actuators"]:
        global_state["actuators"][component] = action
        print(f"[CMD] Command: {component} -> {action}")
        return True
    
    return False
