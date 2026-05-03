import os
import logging
import warnings

# Suppress TensorFlow's internal deprecation warnings before import
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"          # hide C++ INFO/WARNING/ERROR logs
logging.getLogger("tensorflow").setLevel(logging.ERROR)  # hide Python-level TF warnings

from app.core.config import settings

# ── Rice model constants ──────────────────────────────────────────────────────
IMAGE_SIZE = (384, 384)
image_class_type_dirs = ["BG 360", "AT 362", "BW 367", "BG 357"]
image_class_quality_dirs = ["Bad", "Good"]

# ── YOLO — disease detection ──────────────────────────────────────────────────
try:
    from ultralytics import YOLO as _YOLO
    _yolo_model = _YOLO(settings.YOLO_MODEL_PATH) if os.path.exists(settings.YOLO_MODEL_PATH) else None
    if _yolo_model:
        print("[Models] YOLO disease model loaded")
    else:
        print("[Models] YOLO disease model not found — /api/detect-disease unavailable")
except Exception as e:
    _yolo_model = None
    print(f"[Models] YOLO load error: {e}")

# ── YOLO — germination detection ──────────────────────────────────────────────
try:
    from ultralytics import YOLO as _YOLO2
    _germination_model = _YOLO2(settings.GERMINATION_MODEL_PATH) if os.path.exists(settings.GERMINATION_MODEL_PATH) else None
    if _germination_model:
        print("[Models] Germination model loaded")
    else:
        print("[Models] Germination model not found — /api/detect-germination unavailable")
except Exception as e:
    _germination_model = None
    print(f"[Models] Germination load error: {e}")

# ── TensorFlow — rice classifier ──────────────────────────────────────────────
_tf_available = False
_rice_model = None
try:
    import tensorflow as tf
    _rice_model = tf.keras.models.load_model(settings.RICE_MODEL_PATH) if os.path.exists(settings.RICE_MODEL_PATH) else None
    _tf_available = True
    if _rice_model:
        print("[Models] Rice classifier loaded")
    else:
        print("[Models] Rice model not found — /api/predict-rice unavailable")
except Exception as e:
    print(f"[Models] TensorFlow/Rice load error: {e}")

_energy_model = None
_energy_scaler = None
try:
    import joblib
    from sklearn.exceptions import InconsistentVersionWarning

    warnings.filterwarnings("ignore", category=InconsistentVersionWarning)

    if os.path.exists(settings.ENERGY_SCALER_PATH):
        _energy_scaler = joblib.load(settings.ENERGY_SCALER_PATH)

    if _tf_available and os.path.exists(settings.ENERGY_MODEL_PATH):
        _energy_model = tf.keras.models.load_model(settings.ENERGY_MODEL_PATH)

    if _energy_model and _energy_scaler:
        print("[Models] Energy predictor loaded")
    else:
        print("[Models] Energy model/scaler not found - /api/sensor/energy prediction unavailable")
except Exception as e:
    _energy_model = None
    _energy_scaler = None
    print(f"[Models] Energy model load error: {e}")


# ── Public accessors ──────────────────────────────────────────────────────────
def get_yolo_model():
    return _yolo_model


def get_germination_model():
    return _germination_model


def get_rice_model():
    return _rice_model


def get_energy_model():
    return _energy_model


def get_energy_scaler():
    return _energy_scaler


def is_tf_available() -> bool:
    return _tf_available
