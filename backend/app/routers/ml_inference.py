import uuid
import numpy as np
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.services.model_service import (
    get_yolo_model,
    get_germination_model,
    get_rice_model,
    is_tf_available,
    IMAGE_SIZE,
    image_class_type_dirs,
    image_class_quality_dirs,
)

router = APIRouter()


@router.post("/api/predict-rice")
async def predict_rice(file: UploadFile = File(...)):
    if not is_tf_available() or get_rice_model() is None:
        raise HTTPException(status_code=503, detail="Rice prediction model not available on this server")

    import tensorflow as tf

    image_bytes = await file.read()
    image_id = str(uuid.uuid4())
    save_path = f"{settings.IMAGES_DIR}/{image_id}_original.jpg"
    with open(save_path, "wb") as f:
        f.write(image_bytes)

    image = tf.io.decode_jpeg(image_bytes, channels=3)
    image_resized = tf.image.resize(image, IMAGE_SIZE)
    model_input = tf.keras.applications.convnext.preprocess_input(image_resized)
    model_input = tf.expand_dims(model_input, axis=0)

    predictions = get_rice_model().predict(model_input, verbose=0)
    if isinstance(predictions, dict):
        type_probs = predictions["type"][0]
        quality_probs = predictions["quality"][0]
    else:
        type_probs = predictions[0][0]
        quality_probs = predictions[1][0]

    type_idx = np.argmax(type_probs)
    quality_idx = np.argmax(quality_probs)

    return {
        "rice_type": image_class_type_dirs[type_idx],
        "rice_type_confidence": float(type_probs[type_idx]),
        "rice_quality": image_class_quality_dirs[quality_idx],
        "rice_quality_confidence": float(quality_probs[quality_idx]),
        "top_type_predictions": [
            {"name": image_class_type_dirs[i], "confidence": float(type_probs[i])}
            for i in np.argsort(type_probs)[::-1][:3]
        ],
        "quality_probabilities": {
            image_class_quality_dirs[i]: float(quality_probs[i])
            for i in range(len(image_class_quality_dirs))
        },
    }


@router.post("/api/detect-disease")
async def detect_disease(file: UploadFile = File(...)):
    if get_yolo_model() is None:
        raise HTTPException(status_code=503, detail="Disease detection model not available on this server")

    image_bytes = await file.read()
    image_id = str(uuid.uuid4())
    save_path = f"{settings.IMAGES_DIR}/{image_id}_disease.jpg"
    with open(save_path, "wb") as f:
        f.write(image_bytes)

    try:
        results = get_yolo_model()(save_path)
        detections = []
        for r in results:
            for box in r.boxes:
                cls = int(box.cls[0]) if hasattr(box, "cls") else None
                label = r.names[cls] if cls is not None and hasattr(r, "names") else str(cls)
                conf = float(box.conf[0]) if hasattr(box, "conf") else None
                xyxy = box.xyxy[0].tolist() if hasattr(box, "xyxy") else None
                detections.append({"label": label, "confidence": conf, "bbox": xyxy})
        return JSONResponse(content={"detections": detections, "image_id": image_id})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"YOLO inference error: {str(e)}")


@router.post("/api/detect-germination")
async def detect_germination(file: UploadFile = File(...)):
    if get_germination_model() is None:
        raise HTTPException(status_code=503, detail="Germination detection model not available on this server")

    image_bytes = await file.read()
    image_id = str(uuid.uuid4())
    save_path = f"{settings.IMAGES_DIR}/{image_id}_germination.jpg"
    with open(save_path, "wb") as f:
        f.write(image_bytes)

    try:
        results = get_germination_model()(save_path)
        detections = []
        for r in results:
            for box in r.boxes:
                cls = int(box.cls[0]) if hasattr(box, "cls") else None
                label = r.names[cls] if cls is not None and hasattr(r, "names") else str(cls)
                conf = float(box.conf[0]) if hasattr(box, "conf") else None
                xyxy = box.xyxy[0].tolist() if hasattr(box, "xyxy") else None
                detections.append({"label": label, "confidence": conf, "bbox": xyxy})
        return JSONResponse(content={"detections": detections, "image_id": image_id})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Germination inference error: {str(e)}")
