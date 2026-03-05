# Germination Stage Detection - Complete Implementation Guide

## 🎥 Overview

The system now supports **2 camera sources** for germination stage detection:

1. **IoT CAM (ESP32-CAM)** - Continuous monitoring from fixed camera
2. **Mobile Camera** - On-demand photo capture from farmer's phone

Both use the same YOLO11s model but get frames from different sources.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         BACKEND (FastAPI)                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────┐           ┌──────────────────────────┐   │
│  │  ESP32-CAM       │           │  Mobile Phone            │   │
│  │  (IoT Camera)    │───RGB565──│  (Regular Camera)        │   │
│  └────────┬─────────┘  frames   │───JPEG/PNG files────────┤   │
│           │                     │                          │   │
│           │                     │                          │   │
│  ┌────────▼─────────────────────▼──────────────────────┐   │   │
│  │        Image Service (image_service.py)             │   │   │
│  │  ┌──────────────────────────────────────────────┐  │   │   │
│  │  │ Stores latest frame from ESP32-CAM           │  │   │   │
│  │  │ get_current_frame()  ← Used by IoT endpoint   │  │   │   │
│  │  └──────────────────────────────────────────────┘  │   │   │
│  └────────┬──────────────────────────────────────────┘   │   │
│           │                                               │   │
│  ┌────────▼────────────────────────────────────────┐     │   │
│  │      YOLO11s Germination Model                  │     │   │
│  │      (my_model.pt)                              │     │   │
│  │  ┌──────────────────────────────────────────┐  │     │   │
│  │  │ Shared Detection Logic                   │  │     │   │
│  │  │ detect_germination_from_frame()          │  │     │   │
│  │  └──────────────────────────────────────────┘  │     │   │
│  └────────┬────────────────────────────────────────┘     │   │
│           │                                               │   │
│  ┌────────▼─────────────────────────────────────────┐    │   │
│  │              OUTPUT (JSON Response)               │    │   │
│  │  - Detections + Bounding Boxes                   │    │   │
│  │  - Confidence Scores                             │    │   │
│  │  - Image Paths (original + annotated)            │    │   │
│  │  - Camera Source (iot-cam / mobile-camera)       │    │   │
│  └──────────────────────────────────────────────────┘    │   │
│                                                           │   │
└───────────────────────────────────────────────────────────────┘
```

---

## 📡 How Frame Flow Works

### **IoT CAM Flow:**
```
ESP32-CAM
  ↓ (Sends RGB565 frame every 5 seconds)
/api/upload-frame endpoint
  ↓ (esp32_gateway.py routes to image_service)
image_service.process_frame()
  ↓ (Converts RGB565 → JPEG, stores globally)
image_service.get_current_frame()
  ↓ (Frontend calls /api/detect-germination/iot-cam)
YOLO Detection
  ↓
Return Results
```

### **Mobile Camera Flow:**
```
Mobile App
  ↓ (User taps "Capture" and selects image)
/api/detect-germination/mobile-camera (file upload)
  ↓ (FastAPI receives JPEG/PNG)
cv2.imdecode() (decode to OpenCV format)
  ↓
YOLO Detection
  ↓
Return Results
```

---

## 🔌 API Endpoints

### **1. IoT CAM Detection**

**Endpoint:** `POST /api/detect-germination/iot-cam`

**Description:** Captures the latest frame from ESP32-CAM and runs germination detection

**Parameters:**
```
Query Parameters:
- confidence_threshold (optional): float = 0.5
  Default: 0.5 (50% confidence)
  Range: 0.0 - 1.0
```

**Requirements:**
- ESP32-CAM must be actively sending frames
- At least one frame must have been received
- Frames are sent to `/api/upload-frame` endpoint

**Example Request:**
```bash
curl -X POST "http://localhost:8000/api/detect-germination/iot-cam?confidence_threshold=0.6"
```

**Response Example:**
```json
{
  "image_id": "abc-123-def-456",
  "camera_source": "iot-cam",
  "total_detections": 2,
  "germination_stages": [
    {
      "stage": "Stage_2",
      "confidence": 0.94,
      "bounding_box": {
        "x_min": 150,
        "y_min": 120,
        "x_max": 350,
        "y_max": 320,
        "width": 200,
        "height": 200
      }
    },
    {
      "stage": "Stage_1",
      "confidence": 0.87,
      "bounding_box": {
        "x_min": 400,
        "y_min": 250,
        "x_max": 550,
        "y_max": 400,
        "width": 150,
        "height": 150
      }
    }
  ],
  "original_image_path": "images/abc-123-def-456_iot-cam_original.jpg",
  "annotated_image_path": "images/abc-123-def-456_iot-cam_annotated.jpg"
}
```

**Error Responses:**
```json
// No frames from ESP32-CAM yet
{
  "detail": "No frames available from ESP32-CAM. Make sure the IoT camera is connected and sending frames to /api/upload-frame"
}

// Invalid frame received
{
  "detail": "Could not decode image from ESP32-CAM"
}
```

---

### **2. Mobile Camera Detection**

**Endpoint:** `POST /api/detect-germination/mobile-camera`

**Description:** Upload image from mobile phone and run germination detection

**Parameters:**
```
Form Data:
- file (required): Binary image file
  Formats: JPEG, PNG, BMP, etc.
  Size: Any (auto-resized by YOLO)

- confidence_threshold (optional): float = 0.5
  Default: 0.5 (50% confidence)
  Range: 0.0 - 1.0
```

**Example Request (cURL):**
```bash
curl -X POST "http://localhost:8000/api/detect-germination/mobile-camera" \
  -F "file=@seed_photo.jpg" \
  -F "confidence_threshold=0.5"
```

**Example Request (JavaScript/Frontend):**
```javascript
const formData = new FormData();
formData.append('file', imageFile);  // From file input
formData.append('confidence_threshold', 0.5);

const response = await fetch('http://localhost:8000/api/detect-germination/mobile-camera', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data.germination_stages);
```

**Response:** Same format as IoT CAM (see above)

**Error Responses:**
```json
// Invalid image format
{
  "detail": "Invalid image file from mobile camera"
}

// Model not loaded
{
  "detail": "YOLO germination model not loaded. Please ensure my_model.pt is in the backend/app/models/ directory"
}
```

---

### **3. Legacy Endpoint (Backward Compatibility)**

**Endpoint:** `POST /api/predict-germination`

**Note:** This still works but now redirects to `/api/detect-germination/mobile-camera`

---

## 🔧 Backend Code Structure

### **Helper Function: `detect_germination_from_frame()`**

Located in: `app/main.py` (Lines ~290-360)

Purpose: Shared detection logic used by both endpoints

**Parameters:**
```python
def detect_germination_from_frame(
    frame,                      # OpenCV image (BGR format)
    image_id: str,              # Unique ID for tracking
    confidence_threshold: float = 0.5,  # Detection threshold
    camera_source: str = "unknown"      # "iot-cam" or "mobile-camera"
)
```

**What it does:**
1. ✅ Validates YOLO model is loaded
2. ✅ Runs inference on the frame
3. ✅ Extracts detection data (boxes, confidence, class)
4. ✅ Saves original image to disk
5. ✅ Creates annotated image with bounding boxes
6. ✅ Returns JSON with all results

This **eliminates code duplication** - both endpoints use this same function!

---

## 📱 Frontend Integration

### **Using Mobile Camera:**
```javascript
// In your React Native app
import { launchCamera } from 'react-native-image-picker';

const detectFromMobileCamera = async () => {
  launchCamera({ mediaType: 'photo' }, async (response) => {
    if (response.assets) {
      const formData = new FormData();
      formData.append('file', {
        uri: response.assets[0].uri,
        type: response.assets[0].type,
        name: response.assets[0].fileName
      });

      const result = await fetch('http://localhost:8000/api/detect-germination/mobile-camera', {
        method: 'POST',
        body: formData
      });
      
      const data = await result.json();
      console.log('Detections:', data.germination_stages);
      console.log('Annotated image:', data.annotated_image_path);
    }
  });
};
```

### **Using IoT CAM:**
```javascript
// Simply trigger detection from latest IoT frame
const detectFromIoTCam = async () => {
  const response = await fetch('http://localhost:8000/api/detect-germination/iot-cam', {
    method: 'POST'
  });
  
  const data = await response.json();
  console.log('Detections:', data.germination_stages);
};
```

---

## 🚀 Testing the Endpoints

### **Test in Swagger UI:**
1. Open http://localhost:8000/docs
2. Find `POST /api/detect-germination/iot-cam` or `/api/detect-germination/mobile-camera`
3. Click "Try it out"
4. Set confidence_threshold (or upload file)
5. Click "Execute"

### **Test with cURL:**

**IoT CAM:**
```bash
curl -X POST "http://localhost:8000/api/detect-germination/iot-cam?confidence_threshold=0.5"
```

**Mobile Camera:**
```bash
curl -X POST "http://localhost:8000/api/detect-germination/mobile-camera" \
  -F "file=@test_image.jpg"
```

---

## 💾 File Management

### **Where Images are Saved:**

```
backend/
├── images/
│   ├── abc123_iot-cam_original.jpg      ← Original IoT frame
│   ├── abc123_iot-cam_annotated.jpg     ← With bounding boxes
│   ├── def456_mobile-camera_original.jpg ← Original phone photo
│   └── def456_mobile-camera_annotated.jpg ← With bounding boxes
```

### **Cleanup:**
Over time, the `images/` folder will fill up with saved detections. 
You can safely delete old files - they're only for reference.

---

## ⚙️ Configuration & Tuning

### **Confidence Threshold:**

Lower values (0.3-0.4) = More detections but more false positives
```json
{
  "confidence_threshold": 0.3
}
```

Higher values (0.7-0.9) = Fewer detections but more accurate
```json
{
  "confidence_threshold": 0.8
}
```

**Recommended:** Start with 0.5, adjust based on results

### **Model Configuration:**

The YOLO model loads from: `backend/app/models/my_model.pt`

To use a different model:
1. Replace the `.pt` file
2. Restart the backend
3. Check the terminal for "✅ YOLO Germination model loaded"

---

## 🔍 Troubleshooting

### **Issue: "No frames available from ESP32-CAM"**

**Solution:**
- Check ESP32-CAM is connected to network
- Verify ESP32 is sending frames to `/api/upload-frame`
- Check backend logs for frame upload messages
- Adjust ESP32 camera settings if needed

### **Issue: "Invalid image file"**

**Solution:**
- Ensure file is valid JPEG/PNG
- Check file isn't corrupted
- Try with a different image
- Check file size isn't too large

### **Issue: "YOLO model not loaded"**

**Solution:**
- Verify `backend/app/models/my_model.pt` exists
- Restart backend server
- Check for file permission issues
- Ensure ultralytics is installed: `pip install ultralytics`

### **Issue: Low detection accuracy**

**Solution:**
- Adjust confidence_threshold lower
- Check image quality/lighting
- Verify model was trained on similar images
- Consider retraining model with more data

---

## 📊 Response Data Explanation

### **image_id**
Unique identifier for this detection run.
Used to track original and annotated images.

### **camera_source**
- `"iot-cam"` - From ESP32 camera
- `"mobile-camera"` - From phone upload

### **total_detections**
Count of stages found in the image.

### **germination_stages**
Array of all detections with:
- `stage` - Stage name (Stage_1, Stage_2, etc.)
- `confidence` - Detection confidence (0.0-1.0)
- `bounding_box` - Position and size on image

### **Paths**
- `original_image_path` - Raw image saved to disk
- `annotated_image_path` - Image with drawn boxes

---

## 🔗 How It All Connects

```python
# In main.py:

# 1. Load the YOLO model once at startup
yolo_model = YOLO(yolo_model_path, task='detect')

# 2. Define shared detection logic
def detect_germination_from_frame(frame, image_id, confidence_threshold, camera_source):
    # Run model
    results = yolo_model(frame, verbose=False, conf=confidence_threshold)
    # Extract & format results
    # Save images
    # Return JSON

# 3. Endpoint 1: From IoT CAM
@app.post("/api/detect-germination/iot-cam")
async def detect_germination_iot_cam(confidence_threshold: float = 0.5):
    jpeg_frame = image_service.get_current_frame()  # Get latest frame
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)   # Decode
    return detect_germination_from_frame(frame, image_id, confidence_threshold, "iot-cam")

# 4. Endpoint 2: From Mobile
@app.post("/api/detect-germination/mobile-camera")
async def detect_germination_mobile_camera(file: UploadFile = File(...), confidence_threshold: float = 0.5):
    image_bytes = await file.read()                 # Get upload
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)   # Decode
    return detect_germination_from_frame(frame, image_id, confidence_threshold, "mobile-camera")
```

Both endpoints do:
1. Get frame (from different sources)
2. Decode to OpenCV format
3. Call shared detection function
4. Return results

**This is DRY (Don't Repeat Yourself) principle!** ✅

---

## 📝 Summary

You now have a **dual-camera germination detection system** that:

✅ Works with ESP32-CAM (IoT)
✅ Works with Mobile Phone Camera
✅ Uses same YOLO model for both
✅ Saves images for review
✅ Returns structured JSON data
✅ Handles errors gracefully
✅ Is easy to maintain (shared code)

Ready to test! 🚀
