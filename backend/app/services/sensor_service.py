from datetime import datetime
from pydantic import ValidationError

from app.services.state_store import global_state
from app.schemas.websocket import MobilePayload, StationaryPayload


async def process_mobile_data(raw_data: dict):
    """Validate and process data from mobile ESP32 (temp, humidity, air, light, distance)"""
    try:
        data = MobilePayload(**raw_data)
    except ValidationError as e:
        print(f"[Mobile] Invalid payload: {e}")
        return

    if data.temp is not None:
        global_state["sensors"]["temp"] = data.temp
    if data.hum is not None:
        global_state["sensors"]["hum"] = data.hum
    if data.air_quality is not None:
        global_state["sensors"]["air_quality"] = data.air_quality
    if data.dist is not None:
        global_state["sensors"]["dist"] = data.dist
    if data.light is not None:
        global_state["sensors"]["light"] = data.light

    global_state["devices"]["mobile"]["connected"] = True
    global_state["devices"]["mobile"]["last_seen"] = datetime.now().isoformat()

    if data.temp is not None and data.temp > 35.0:
        print("[ALERT] Temperature too high!")
    if data.air_quality is not None and data.air_quality < 30:
        print("[WARN]  Poor air quality detected!")

    print(f"[Mobile] T:{data.temp}C H:{data.hum}% AQ:{data.air_quality}% L:{data.light}% D:{data.dist}cm")


async def process_stationary_data(raw_data: dict):
    """Validate and process data from stationary ESP32 controller."""
    if raw_data.get("type") == "heartbeat":
        global_state["devices"]["stationary"]["connected"] = True
        now = datetime.now().isoformat()
        global_state["devices"]["stationary"]["last_seen"] = now
        global_state["devices"]["stationary"]["last_heartbeat"] = now
        global_state["devices"]["stationary"]["heartbeat"] = {
            "status": raw_data.get("status", "UNKNOWN"),
            "heap": raw_data.get("heap"),
            "wifi_rssi": raw_data.get("wifi_rssi"),
            "safe_mode": raw_data.get("safe_mode"),
            "homing": raw_data.get("homing"),
            "motor_enabled": raw_data.get("motor_enabled"),
            "sensors": raw_data.get("sensors", {}),
            "actuators": raw_data.get("actuators", {}),
            "limits": raw_data.get("limits", {}),
        }
        print(
            "[Stationary] Heartbeat "
            f"status:{raw_data.get('status')} "
            f"safe_mode:{raw_data.get('safe_mode')} "
            f"rssi:{raw_data.get('wifi_rssi')}"
        )
        return

    try:
        data = StationaryPayload(**raw_data)
    except ValidationError as e:
        print(f"[Stationary] Invalid payload: {e}")
        return

    if data.ph is not None:
        global_state["sensors"]["ph"] = data.ph
    if data.energy_status is not None:
        global_state["sensors"]["energy_status"] = data.energy_status
    if data.energy_voltage is not None:
        global_state["sensors"]["energy_voltage"] = data.energy_voltage
    if data.energy_current is not None:
        global_state["sensors"]["energy_current"] = data.energy_current
    if data.energy_power is not None:
        global_state["sensors"]["energy_power"] = data.energy_power
    if data.energy_total is not None:
        global_state["sensors"]["energy_total"] = data.energy_total
    if data.temp is not None:
        global_state["sensors"]["temp"] = data.temp
    if data.hum is not None:
        global_state["sensors"]["hum"] = data.hum
    if data.light is not None:
        global_state["sensors"]["light"] = data.light
    if data.air_quality is not None:
        global_state["sensors"]["air_quality"] = data.air_quality

    global_state["devices"]["stationary"]["connected"] = True
    global_state["devices"]["stationary"]["last_seen"] = datetime.now().isoformat()

    if data.ph is not None and (data.ph < 5.5 or data.ph > 7.5):
        print(f"[WARN]  pH out of range: {data.ph}")
    if data.energy_status == "ERROR":
        print("[WARN]  Energy monitor disconnected!")
    if data.temp is not None and data.temp > 35.0:
        print(f"[WARN]  Temperature too high: {data.temp}C")
    if data.air_quality is not None and data.air_quality > 70:
        print(f"[WARN]  Poor air quality: {data.air_quality}%")

    print(f"[Stationary] pH:{data.ph} T:{data.temp}C H:{data.hum}% L:{data.light}% AQ:{data.air_quality}% Power:{data.energy_power}W")
