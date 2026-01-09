from app.services.state_store import global_state

async def process_mobile_data(data: dict):
    """Process data from mobile ESP32 (temp, humidity, air quality, distance)"""
    # Update State
    if "temp" in data: 
        global_state["sensors"]["temp"] = data["temp"]
    if "hum" in data: 
        global_state["sensors"]["hum"] = data["hum"]
    if "air_quality" in data: 
        global_state["sensors"]["air_quality"] = data["air_quality"]
    if "dist" in data: 
        global_state["sensors"]["dist"] = data["dist"]
    if "light" in data: 
        global_state["sensors"]["light"] = data["light"]
    
    # Add Logic: Check for Alerts
    if data.get("temp", 0) > 35.0:
        print("🔥 ALERT: Temperature is too high!")
    
    if data.get("air_quality", 0) < 30:
        print("⚠️  ALERT: Poor air quality detected!")

async def process_stationary_data(data: dict):
    """Process data from stationary ESP32 (pH, additional sensors)"""
    if "ph" in data: 
        global_state["sensors"]["ph"] = data["ph"]
    
    # pH Alert Logic
    ph_value = data.get("ph", 7.0)
    if ph_value < 5.5 or ph_value > 7.5:
        print(f"⚠️  ALERT: pH out of range: {ph_value}")
