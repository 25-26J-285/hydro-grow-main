# Quick Test Guide - Germination Detection (Both Cameras)

## ✅ Setup Checklist

- [ ] Copy `my_model.pt` to `backend/app/models/my_model.pt`
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Backend running: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- [ ] See "✅ YOLO Germination model loaded" in terminal

---

## 🎥 Option 1: Test IoT CAM Detection

### When to use:
- You have ESP32-CAM connected and sending frames
- Want to capture current camera view automatically
- Need real-time monitoring

### Quick Test:
```bash
# After ESP32-CAM has sent at least one frame
curl -X POST "http://localhost:8000/api/detect-germination/iot-cam"
```

### In Swagger UI:
1. Go to http://localhost:8000/docs
2. Click "POST /api/detect-germination/iot-cam"
3. Click "Try it out" → "Execute"
4. Wait for results

### Expected Response:
```json
{
  "image_id": "xyz-123",
  "camera_source": "iot-cam",
  "total_detections": 2,
  "germination_stages": [
    {
      "stage": "Stage_2",
      "confidence": 0.95,
      "bounding_box": {
        "x_min": 100, "y_min": 150,
        "x_max": 300, "y_max": 350,
        "width": 200, "height": 200
      }
    }
  ]
}
```

---

## 📱 Option 2: Test Mobile Camera Detection

### When to use:
- Farmer takes photo with phone camera
- Want on-demand detection (not continuous)
- Better image quality from dedicated camera app

### Quick Test (Using curl):
```bash
curl -X POST "http://localhost:8000/api/detect-germination/mobile-camera" \
  -F "file=@path/to/your/image.jpg"
```

### In Swagger UI:
1. Go to http://localhost:8000/docs
2. Click "POST /api/detect-germination/mobile-camera"
3. Click "Try it out"
4. Click "Select File" and choose an image
5. Click "Execute"

### In Frontend (JavaScript):
```javascript
const detectFromMobile = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  
  const response = await fetch('http://localhost:8000/api/detect-germination/mobile-camera', {
    method: 'POST',
    body: formData
  });
  
  const results = await response.json();
  console.log('Detections:', results.germination_stages);
};
```

### Expected Response:
Same as IoT CAM (see above)

---

## 🔧 Adjust Detection Sensitivity

### More Detections (Lower threshold):
```bash
# Find germination even with low confidence
curl -X POST "http://localhost:8000/api/detect-germination/iot-cam?confidence_threshold=0.3"
```

### Fewer Detections (Higher threshold):
```bash
# Only very confident detections
curl -X POST "http://localhost:8000/api/detect-germination/mobile-camera?confidence_threshold=0.9" \
  -F "file=@image.jpg"
```

---

## 📊 Response Fields Explained

| Field | Example | Meaning |
|-------|---------|---------|
| `image_id` | "abc-123-def" | Unique ID for this detection |
| `camera_source` | "iot-cam" or "mobile-camera" | Which camera was used |
| `total_detections` | 2 | How many germination stages found |
| `stage` | "Stage_2" | Germination stage name |
| `confidence` | 0.95 | How sure (95%) the model is |
| `x_min, y_min` | 100, 150 | Top-left corner pixel location |
| `x_max, y_max` | 300, 350 | Bottom-right corner pixel location |
| `width, height` | 200, 200 | Detected box size in pixels |

---

## 🖼️ Saved Images

After detection, 2 images are saved in `backend/images/`:

1. **Original** - Raw image from camera
   ```
   images/abc-123_iot-cam_original.jpg
   images/xyz-456_mobile-camera_original.jpg
   ```

2. **Annotated** - With drawn bounding boxes & labels
   ```
   images/abc-123_iot-cam_annotated.jpg
   images/xyz-456_mobile-camera_annotated.jpg
   ```

You can view these images to verify detections!

---

## ❌ Troubleshooting

### "No frames available from ESP32-CAM"
- ESP32 not connected or not sending frames
- Check ESP32 is running and sending to `/api/upload-frame`
- Check backend logs for frame upload messages

### "Invalid image file"
- Image file corrupted or wrong format
- Try a different image file
- Ensure file is JPEG, PNG, or BMP

### "YOLO model not loaded"
- `my_model.pt` not in `backend/app/models/`
- File permissions issue
- Restart backend server

### "Confidence threshold must be 0.0-1.0"
- Use values between 0.0 and 1.0
- Default 0.5 is usually good
- Try 0.3-0.7 for best results

---

## 📈 Performance Tips

1. **Good lighting** - Clear photos = better detection
2. **Close distance** - Get the seed/sprout in frame
3. **Focused image** - Don't blur the target
4. **Adjust threshold** - Lower if missing detections, higher if too many
5. **Check annotated image** - Verify results visually

---

## 🎯 Common Use Cases

### Scenario 1: Monitor IoT Camera Feed
```
IoT camera always running → Farmer checks status → 
Click "Detect Germination" → Shows current stages
```
Endpoint: `POST /api/detect-germination/iot-cam`

### Scenario 2: Mobile Photo Verification
```
Farmer takes photo with phone → Opens app → 
Uploads image → Shows detected stages with boxes
```
Endpoint: `POST /api/detect-germination/mobile-camera`

### Scenario 3: Hybrid (Best)
```
IoT camera provides overview → 
Mobile camera provides detailed close-ups → 
Cross-reference results → Better decision making
```
Use both endpoints!

---

## 📚 Full Documentation

For complete details, see: `GERMINATION_DETECTION_GUIDE.md`

Topics covered:
- System architecture diagram
- How frames flow through the system
- API endpoint specifications
- Frontend integration examples
- Troubleshooting guide
- Response data explanation
- Code structure details

---

## ✨ You Now Have:

✅ Dual-camera germination detection
✅ IoT camera integration (ESP32-CAM)
✅ Mobile photo detection
✅ Automatic image saving
✅ Bounding box visualization
✅ Confidence scoring
✅ Easy testing in Swagger UI
✅ Production-ready endpoints

**Ready to test? Start with Swagger UI at http://localhost:8000/docs** 🚀
