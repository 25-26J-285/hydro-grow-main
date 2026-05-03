from collections import deque
from typing import Any
import warnings

import numpy as np

from app.services.model_service import get_energy_model, get_energy_scaler
from app.services.state_store import global_state

FEATURE_NAMES = [
    "Environment Humidity(%)",
    "Environment Light Intensity(lux)",
    "Environment Temperature(celsius)",
    "Soil pH(pH)",
    "Energy(Wh)",
]
ENERGY_FEATURE_INDEX = FEATURE_NAMES.index("Energy(Wh)")
SEQUENCE_LENGTH = 24
_history: deque[list[float]] = deque(maxlen=SEQUENCE_LENGTH * 10)


def _build_feature_vector() -> list[float]:
    sensors = global_state["sensors"]
    return [
        float(sensors["hum"] or 0.0),
        float(sensors["light"] or 0.0),
        float(sensors["temp"] or 0.0),
        float(sensors["ph"] or 0.0),
        float(sensors["energy_total"] or 0.0) * 1000.0,
    ]


def record_sensor_snapshot() -> None:
    feature_vector = _build_feature_vector()
    if not any(feature_vector):
        return
    _history.append(feature_vector)


def _inverse_energy_value(predicted_scaled_value: float) -> float:
    scaler = get_energy_scaler()
    placeholder = np.zeros((1, len(FEATURE_NAMES)), dtype=np.float32)
    placeholder[0, ENERGY_FEATURE_INDEX] = predicted_scaled_value
    restored = scaler.inverse_transform(placeholder)
    return float(restored[0, ENERGY_FEATURE_INDEX])


def get_energy_prediction() -> dict[str, Any]:
    model = get_energy_model()
    scaler = get_energy_scaler()

    if model is None or scaler is None:
        return {
            "available": False,
            "reason": "Energy model is not loaded on the server.",
            "samples_collected": len(_history),
            "samples_needed": SEQUENCE_LENGTH,
        }

    if len(_history) < SEQUENCE_LENGTH:
        return {
            "available": False,
            "reason": f"Collecting live sensor history ({len(_history)}/{SEQUENCE_LENGTH} samples).",
            "samples_collected": len(_history),
            "samples_needed": SEQUENCE_LENGTH,
        }

    window = np.asarray(list(_history)[-SEQUENCE_LENGTH:], dtype=np.float32)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", category=UserWarning)
        scaled_window = scaler.transform(window)
    model_input = np.expand_dims(scaled_window, axis=0)
    predicted_scaled = float(model.predict(model_input, verbose=0)[0][0])
    predicted_wh = max(_inverse_energy_value(predicted_scaled), 0.0)

    return {
        "available": True,
        "predicted_energy_wh": predicted_wh,
        "predicted_energy_kwh": predicted_wh / 1000.0,
        "samples_collected": len(_history),
        "samples_used": SEQUENCE_LENGTH,
        "features": FEATURE_NAMES,
    }
