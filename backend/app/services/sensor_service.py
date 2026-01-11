from app.services.state_store import global_state
from datetime import datetime

async def process_mobile_data(data: dict):
    """Process data from mobile ESP32 (temp, humidity, air quality, light, distance)"""
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
    
    # Update device status
    global_state["devices"]["mobile"]["connected"] = True
    global_state["devices"]["mobile"]["last_seen"] = datetime.now().isoformat()
    
    # Add Logic: Check for Alerts
    if data.get("temp", 0) > 35.0:
        print("🔥 ALERT: Temperature is too high!")
    
    if data.get("air_quality", 0) < 30:
        print("⚠️  ALERT: Poor air quality detected!")
    
    print(f"📱 Mobile Data: T:{data.get('temp')}°C H:{data.get('hum')}% AQ:{data.get('air_quality')}% L:{data.get('light')}% D:{data.get('dist')}cm")

async def process_stationary_data(data: dict):
    """Process data from stationary ESP32 (pH, energy monitoring)"""
    # pH Sensor
    if "ph" in data: 
        global_state["sensors"]["ph"] = data["ph"]
    
    # Energy Monitoring (PZEM-004T)
    if "energy_status" in data:
        global_state["sensors"]["energy_status"] = data["energy_status"]
    if "energy_voltage" in data:
        global_state["sensors"]["energy_voltage"] = data["energy_voltage"]
    if "energy_current" in data:
        global_state["sensors"]["energy_current"] = data["energy_current"]
    if "energy_power" in data:
        global_state["sensors"]["energy_power"] = data["energy_power"]
    if "energy_total" in data:
        global_state["sensors"]["energy_total"] = data["energy_total"]
    
    # Update device status
    global_state["devices"]["stationary"]["connected"] = True
    global_state["devices"]["stationary"]["last_seen"] = datetime.now().isoformat()
    
    # pH Alert Logic
    ph_value = data.get("ph", 7.0)
    if ph_value < 5.5 or ph_value > 7.5:
        print(f"⚠️  ALERT: pH out of range: {ph_value}")
    
    # Energy Alert
    if data.get("energy_status") == "ERROR":
        print("⚠️  ALERT: Energy monitor disconnected!")
    
    print(f"🏠 Stationary Data: pH:{data.get('ph')} Power:{data.get('energy_power')}W Status:{data.get('energy_status')}")
