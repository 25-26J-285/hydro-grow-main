from datetime import datetime, timezone

from app.core.config import settings
from app.db.mongodb import db


def _clean_document(document: dict) -> dict:
    return {key: value for key, value in document.items() if value is not None}


async def save_sensor_reading(device_type: str, payload: dict) -> dict:
    document = _clean_document(
        {
            "device_type": device_type,
            "device_id": payload.get("device_id") or f"{device_type}-esp32",
            "recorded_at": datetime.now(timezone.utc).isoformat(),
            **payload,
        }
    )
    collection = db.get_database()[settings.MONGODB_SENSOR_COLLECTION]
    result = await collection.insert_one(document)
    document["_id"] = result.inserted_id
    return document


def _serialize_reading(document: dict) -> dict:
    return {
        "id": str(document["_id"]),
        "device_type": document.get("device_type"),
        "device_id": document.get("device_id"),
        "recorded_at": document.get("recorded_at"),
        "temp": document.get("temp"),
        "hum": document.get("hum"),
        "air_quality": document.get("air_quality"),
        "light": document.get("light"),
        "dist": document.get("dist"),
        "ph": document.get("ph"),
        "energy_status": document.get("energy_status"),
        "energy_voltage": document.get("energy_voltage"),
        "energy_current": document.get("energy_current"),
        "energy_power": document.get("energy_power"),
        "energy_total": document.get("energy_total"),
    }


async def get_latest_sensor_readings() -> dict:
    collection = db.get_database()[settings.MONGODB_SENSOR_COLLECTION]

    mobile = await collection.find_one({"device_type": "mobile"}, sort=[("recorded_at", -1)])
    stationary = await collection.find_one({"device_type": "stationary"}, sort=[("recorded_at", -1)])

    return {
        "mobile": _serialize_reading(mobile) if mobile else None,
        "stationary": _serialize_reading(stationary) if stationary else None,
    }


async def get_sensor_history(device_type: str | None = None, limit: int = 50) -> list[dict]:
    collection = db.get_database()[settings.MONGODB_SENSOR_COLLECTION]
    query = {"device_type": device_type} if device_type else {}

    cursor = collection.find(query).sort("recorded_at", -1).limit(limit)
    documents = await cursor.to_list(length=limit)
    return [_serialize_reading(document) for document in documents]
