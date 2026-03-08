from fastapi import APIRouter
from app.services.state_store import global_state

router = APIRouter()


@router.get("/api/sensor/temp")
async def get_temperature():
    return {"value": global_state["sensors"]["temp"], "unit": "°C", "sensor": "DHT22", "device": "mobile"}


@router.get("/api/sensor/humidity")
async def get_humidity():
    return {"value": global_state["sensors"]["hum"], "unit": "%", "sensor": "DHT22", "device": "mobile"}


@router.get("/api/sensor/air")
async def get_air_quality():
    return {"value": global_state["sensors"]["air_quality"], "unit": "%", "sensor": "MQ-135", "device": "mobile"}


@router.get("/api/sensor/light")
async def get_light():
    return {"value": global_state["sensors"]["light"], "unit": "%", "sensor": "LDR", "device": "mobile"}


@router.get("/api/sensor/dist")
async def get_distance():
    return {"value": global_state["sensors"]["dist"], "unit": "cm", "sensor": "HC-SR04", "device": "mobile"}


@router.get("/api/sensor/ph")
async def get_ph():
    return {"value": global_state["sensors"]["ph"], "unit": "pH", "sensor": "Analog pH", "device": "stationary"}


@router.get("/api/sensor/energy")
async def get_energy():
    return {
        "status": global_state["sensors"]["energy_status"],
        "voltage": global_state["sensors"]["energy_voltage"],
        "current": global_state["sensors"]["energy_current"],
        "power": global_state["sensors"]["energy_power"],
        "total_energy": global_state["sensors"]["energy_total"],
        "unit": {"voltage": "V", "current": "A", "power": "W", "energy": "kWh"},
        "sensor": "PZEM-004T",
        "device": "stationary",
    }


@router.get("/api/sensors/all")
async def get_all_sensors():
    return {
        "mobile": {
            "temp": global_state["sensors"]["temp"],
            "humidity": global_state["sensors"]["hum"],
            "air_quality": global_state["sensors"]["air_quality"],
            "light": global_state["sensors"]["light"],
            "distance": global_state["sensors"]["dist"],
        },
        "stationary": {
            "ph": global_state["sensors"]["ph"],
            "energy": {
                "status": global_state["sensors"]["energy_status"],
                "voltage": global_state["sensors"]["energy_voltage"],
                "current": global_state["sensors"]["energy_current"],
                "power": global_state["sensors"]["energy_power"],
                "total": global_state["sensors"]["energy_total"],
            },
        },
    }
