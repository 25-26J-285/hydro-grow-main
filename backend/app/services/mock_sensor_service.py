"""
Mock Sensor Data Generator Service
Simulates realistic sensor readings without ESP32 hardware
"""
import asyncio
import random
import math
from datetime import datetime
from typing import Dict, Optional
from app.services.state_store import global_state
from app.services import sensor_service

# Configuration for realistic sensor ranges
SENSOR_CONFIG = {
    "temp": {"min": 18.0, "max": 32.0, "ideal": 25.0, "variance": 0.5},
    "hum": {"min": 40.0, "max": 80.0, "ideal": 65.0, "variance": 2.0},
    "air_quality": {"min": 60.0, "max": 100.0, "ideal": 85.0, "variance": 3.0},
    "light": {"min": 0.0, "max": 100.0, "ideal": 75.0, "variance": 5.0},
    "dist": {"min": 5, "max": 50, "ideal": 15, "variance": 2},
    "ph": {"min": 5.0, "max": 8.0, "ideal": 6.5, "variance": 0.2},
    "energy_voltage": {"min": 210.0, "max": 230.0, "ideal": 220.0, "variance": 2.0},
    "energy_current": {"min": 0.1, "max": 2.0, "ideal": 0.5, "variance": 0.1},
}

# Mock state tracking
mock_state = {
    "is_running": False,
    "update_interval": 2.0,  # seconds between updates
    "simulation_time": 0.0,  # for sine wave patterns
}


def generate_realistic_value(sensor_name: str, time_offset: float = 0.0) -> float:
    """
    Generate realistic sensor values with natural variation
    Uses sine waves for daily patterns + random noise
    """
    config = SENSOR_CONFIG.get(sensor_name)
    if not config:
        return 0.0
    
    # Base value from ideal
    base = config["ideal"]
    
    # Add sine wave for daily patterns (24-hour cycle)
    # Simulate temperature rising during "day" and dropping at "night"
    hour_angle = (time_offset / 3600.0) * (2 * math.pi / 24.0)
    daily_variation = math.sin(hour_angle) * (config["max"] - config["min"]) * 0.15
    
    # Add random noise
    noise = random.uniform(-config["variance"], config["variance"])
    
    # Combine and clamp to valid range
    value = base + daily_variation + noise
    value = max(config["min"], min(config["max"], value))
    
    # Round appropriately
    if sensor_name == "dist":
        return int(value)
    elif sensor_name == "ph":
        return round(value, 1)
    else:
        return round(value, 2)


def calculate_energy_power(voltage: float, current: float) -> float:
    """Calculate power from voltage and current"""
    return round(voltage * current, 2)


def generate_mobile_sensor_data(time_offset: float = 0.0) -> Dict:
    """Generate mock data for mobile ESP32 sensors"""
    
    # Simulate day/night cycle for light
    hour = (time_offset / 3600.0) % 24
    if 6 <= hour <= 20:  # Daytime (6 AM - 8 PM)
        light_multiplier = 1.0
    else:  # Nighttime
        light_multiplier = 0.2
    
    temp = generate_realistic_value("temp", time_offset)
    hum = generate_realistic_value("hum", time_offset)
    
    # Higher temp = lower humidity (inverse relationship)
    if temp > 28:
        hum = max(40, hum - 5)
    
    return {
        "temp": temp,
        "hum": hum,
        "air_quality": generate_realistic_value("air_quality", time_offset),
        "light": generate_realistic_value("light", time_offset) * light_multiplier,
        "dist": generate_realistic_value("dist", time_offset),
        "device_id": "MOCK_MOBILE",
        "timestamp": datetime.now().isoformat()
    }


def generate_stationary_sensor_data(time_offset: float = 0.0) -> Dict:
    """Generate mock data for stationary ESP32 sensors"""
    
    voltage = generate_realistic_value("energy_voltage", time_offset)
    current = generate_realistic_value("energy_current", time_offset)
    power = calculate_energy_power(voltage, current)
    
    # Accumulate energy over time (very rough simulation)
    current_total = global_state["sensors"]["energy_total"]
    new_total = current_total + (power / 1000.0) * (mock_state["update_interval"] / 3600.0)
    
    return {
        "ph": generate_realistic_value("ph", time_offset),
        "energy_status": "OK" if random.random() > 0.05 else "WARNING",
        "energy_voltage": voltage,
        "energy_current": current,
        "energy_power": power,
        "energy_total": round(new_total, 3),
        "device_id": "MOCK_STATIONARY",
        "timestamp": datetime.now().isoformat()
    }


async def simulate_sensor_updates():
    """
    Continuously generate and update sensor data
    Runs in background task
    """
    print("🧪 Starting MOCK sensor data simulation")
    print(f"📊 Update interval: {mock_state['update_interval']} seconds")
    
    mock_state["is_running"] = True
    mock_state["simulation_time"] = 0.0
    
    try:
        while mock_state["is_running"]:
            # Generate mobile sensor data
            mobile_data = generate_mobile_sensor_data(mock_state["simulation_time"])
            await sensor_service.process_mobile_data(mobile_data)
            
            # Generate stationary sensor data
            stationary_data = generate_stationary_sensor_data(mock_state["simulation_time"])
            await sensor_service.process_stationary_data(stationary_data)
            
            # Log to console (optional - comment out if too verbose)
            print(f"📱 MOCK Mobile: T:{mobile_data['temp']}°C H:{mobile_data['hum']}% "
                  f"L:{mobile_data['light']:.0f}% AQ:{mobile_data['air_quality']:.0f}%")
            print(f"🏠 MOCK Stationary: pH:{stationary_data['ph']} "
                  f"Power:{stationary_data['energy_power']}W")
            
            # Advance simulation time
            mock_state["simulation_time"] += mock_state["update_interval"]
            
            # Wait before next update
            await asyncio.sleep(mock_state["update_interval"])
            
    except asyncio.CancelledError:
        print("🛑 Mock sensor simulation stopped")
        mock_state["is_running"] = False
        raise
    except Exception as e:
        print(f"❌ Mock sensor error: {e}")
        mock_state["is_running"] = False


async def start_mock_sensors(update_interval: float = 2.0):
    """
    Start generating mock sensor data
    
    Args:
        update_interval: Seconds between sensor updates (default: 2.0)
    """
    if mock_state["is_running"]:
        return {"success": False, "message": "Mock sensors already running"}
    
    mock_state["update_interval"] = update_interval
    
    # Start background task
    asyncio.create_task(simulate_sensor_updates())
    
    return {
        "success": True,
        "message": "Mock sensor simulation started",
        "update_interval": update_interval,
        "is_simulation": True
    }


async def stop_mock_sensors():
    """Stop generating mock sensor data"""
    if not mock_state["is_running"]:
        return {"success": False, "message": "Mock sensors not running"}
    
    mock_state["is_running"] = False
    
    return {
        "success": True,
        "message": "Mock sensor simulation stopped"
    }


def get_mock_sensor_status() -> Dict:
    """Get current status of mock sensor simulation"""
    return {
        "is_running": mock_state["is_running"],
        "update_interval": mock_state["update_interval"],
        "simulation_time": round(mock_state["simulation_time"], 1),
        "current_values": {
            "mobile": {
                "temp": global_state["sensors"]["temp"],
                "humidity": global_state["sensors"]["hum"],
                "air_quality": global_state["sensors"]["air_quality"],
                "light": global_state["sensors"]["light"],
                "distance": global_state["sensors"]["dist"]
            },
            "stationary": {
                "ph": global_state["sensors"]["ph"],
                "energy_voltage": global_state["sensors"]["energy_voltage"],
                "energy_current": global_state["sensors"]["energy_current"],
                "energy_power": global_state["sensors"]["energy_power"],
                "energy_total": global_state["sensors"]["energy_total"]
            }
        },
        "is_simulation": True
    }


def generate_single_snapshot() -> Dict:
    """
    Generate a single snapshot of all sensor data
    Useful for one-time testing without continuous simulation
    """
    mobile_data = generate_mobile_sensor_data(0.0)
    stationary_data = generate_stationary_sensor_data(0.0)
    
    return {
        "mobile": mobile_data,
        "stationary": stationary_data,
        "timestamp": datetime.now().isoformat(),
        "is_simulation": True
    }
