from pydantic import BaseModel
from typing import Optional


class MobilePayload(BaseModel):
    """Expected JSON payload from mobile ESP32 (robot with sensors)"""
    temp: Optional[float] = None
    hum: Optional[float] = None
    air_quality: Optional[float] = None
    dist: Optional[float] = None
    light: Optional[float] = None


class StationaryPayload(BaseModel):
    """Expected JSON payload from stationary ESP32 (pH + energy hub)"""
    ph: Optional[float] = None
    energy_status: Optional[str] = None
    energy_voltage: Optional[float] = None
    energy_current: Optional[float] = None
    energy_power: Optional[float] = None
    energy_total: Optional[float] = None
