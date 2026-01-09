from app.services.state_store import global_state

async def process_command(command: dict):
    """Process control command and update state"""
    component = command.get("component")
    action = command.get("action")
    
    # Update state
    if component in global_state["actuators"]:
        global_state["actuators"][component] = action
        print(f"🎮 Command: {component} → {action}")
        return True
    
    return False
