# A simple in-memory store for the latest sensor data
global_state = {
    "sensors": {
        # Mobile ESP32-CAM sensors
        "temp": 0.0, 
        "hum": 0.0, 
        "air_quality": 0.0, 
        "light": 0.0, 
        "dist": 0,
        # Stationary ESP32 sensors
        "ph": 0.0,
        "energy_status": "UNKNOWN",
        "energy_voltage": 0.0,
        "energy_current": 0.0,
        "energy_power": 0.0,
        "energy_total": 0.0
    },
    "actuators": {
        "pump": "OFF", 
        "fan": "OFF", 
        "led_strip": "OFF",
        "brightness": 0,  # 0-255
        "rail": "STOP"
    },
    "devices": {
        "stationary": {"connected": False, "last_seen": None},
        "mobile": {"connected": False, "last_seen": None}
    }
}
