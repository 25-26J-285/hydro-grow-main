# A simple in-memory store for the latest sensor data
global_state = {
    "sensors": {
        "temp": 0.0, 
        "hum": 0.0, 
        "air_quality": 0.0, 
        "light": 0.0, 
        "dist": 0, 
        "ph": 0.0
    },
    "actuators": {
        "pump": "OFF", 
        "fan": "OFF", 
        "light": "OFF", 
        "rail": "STOP"
    }
}
