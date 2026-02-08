# 🧪 Testing Guide - Mock Data Simulation

## Overview
Test the HydroGrow system **without ESP32 hardware** using mock data simulation for:
- **Shelf Scanning** - Simulates plant detection on shelves
- **Sensor Data** - Generates realistic sensor readings continuously

---

## Prerequisites

✅ Backend running on http://127.0.0.1:8000  
✅ Frontend running (optional for mobile app testing)

---

## 📊 Mock Sensor Data Testing

### Quick Start
```powershell
# Start generating mock sensor data (updates every 2 seconds)
curl -X POST http://localhost:8000/api/sensors/mock/start

# Read sensor values (use regular sensor endpoints)
curl http://localhost:8000/api/sensor/temp
curl http://localhost:8000/api/sensor/humidity
curl http://localhost:8000/api/sensor/ph
curl http://localhost:8000/api/sensors/all

# Check mock status
curl http://localhost:8000/api/sensors/mock/status

# Stop mock sensors
curl -X POST http://localhost:8000/api/sensors/mock/stop
```

### Simulated Sensors
**Mobile ESP32:** Temperature, Humidity, Air Quality, Light, Distance  
**Stationary ESP32:** pH, Energy Voltage/Current/Power/Total

### Features
- ✅ Realistic value ranges with natural variation
- ✅ Daily cycles (temperature and light patterns)
- ✅ Sensor relationships (temp affects humidity)
- ✅ Configurable update intervals
- ✅ Energy accumulation over time

### API Endpoints
- `POST /api/sensors/mock/start?update_interval=2.0` - Start simulation
- `POST /api/sensors/mock/stop` - Stop simulation
- `GET /api/sensors/mock/status` - Check status
- `GET /api/sensors/mock/snapshot` - Get single snapshot without continuous updates

---

## 🔍 Shelf Scanning Simulation Testing

## Testing Methods

### **Method 1: Mobile App Testing** 🔥 **EASIEST**

1. **Open the app** (Expo Go or web browser)

2. **Navigate to Shelves Identification**:
   - From dashboard → "Add Plant" button
   - Or directly open the shelves screen

3. **Tap the "Scan" button**

4. **Watch the simulation**:
   - Loading spinner appears
   - "Scanning Shelves..." message
   - Takes ~3 seconds

5. **View Results**:
   - Shelf list automatically updates
   - Green cards = Plants detected
   - Gray cards = Empty
   - Shows confidence percentage

6. **Repeat**: Tap "Scan" again to get different random results

**Note**: The app is currently set to use mock mode (`useMockScan = true` in code)

---

### **Method 2: PowerShell Script** 🪟 **RECOMMENDED FOR WINDOWS**

1. **Open PowerShell** in the project root:
   ```powershell
   cd "C:\Users\sudeepa\Desktop\Research app OLD\2.4.26\hydro-grow-main"
   ```

2. **Run the test script**:
   ```powershell
   .\test-scan.ps1
   ```

3. **Expected Output**:
   ```
   🧪 HydroGrow Shelf Scanning Test
   =================================
   
   Testing API Connection...
   ✅ Backend is running!
   
   Starting Mock Scan...
   (Simulating ESP32-CAM movement from top-right to bottom-left)
   
   ✅ Scan completed successfully!
   
   📊 Results:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   🌱 Shelf 01
      Status: ACTIVE
      Stage: Growing
      Confidence: 78.4%
      Plants Detected: 2
   
   ⚪ Shelf 02
      Status: EMPTY
      Stage: Empty
   
   🌱 Shelf 03
      Status: ACTIVE
      Stage: Mature
      Confidence: 91.2%
      Plants Detected: 3
   
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   Summary:
     Total Shelves Scanned: 3
     Shelves with Plants: 2
     Empty Shelves: 1
   
   💾 Results saved to: scan_results_2026-02-04_15-30-45.json
   ```

4. **View saved results**:
   - JSON file created with timestamp
   - Contains full scan data

---

### **Method 3: Python Script** 🐍 **CROSS-PLATFORM**

1. **Install colorama** (for colored output):
   ```bash
   pip install colorama requests
   ```

2. **Run the test script**:
   ```bash
   python test-scan.py
   ```

3. **Output**: Same format as PowerShell script

---

### **Method 4: Direct API Testing** 🔧 **FOR DEBUGGING**

#### Using cURL:
```bash
# Start mock scan
curl -X POST http://127.0.0.1:8000/api/scan/mock

# Check scan status
curl http://127.0.0.1:8000/api/scan/mock/status
```

#### Using Browser:
1. Open API docs: http://127.0.0.1:8000/docs
2. Find `POST /api/scan/mock`
3. Click "Try it out" → "Execute"
4. View response in browser

#### Using Postman:
```
POST http://127.0.0.1:8000/api/scan/mock
Headers: Content-Type: application/json
Body: (empty)
```

---

## Understanding the Results

### Shelf Data Structure:
```json
{
  "shelf_id": 1,
  "shelf_name": "Shelf 01",
  "has_plant": true,
  "positions_scanned": 3,
  "plants_detected": 2,
  "avg_confidence": 78.45,
  "stage": "Growing",
  "status": "Growing"
}
```

### Plant Stages:
- **Seedling**: 5-15% green coverage, low confidence
- **Growing**: 15-30% green coverage, medium confidence
- **Mature**: >30% green coverage, high confidence
- **Empty**: <5% green coverage, no plant

### Confidence Levels:
- **60-70%**: Low confidence (early stage or partial view)
- **70-85%**: Medium confidence (clear plant visible)
- **85-95%**: High confidence (mature, healthy plant)

---

## Mock vs Real Scanning

### Mock Mode (Current - No Hardware):
```typescript
const useMockScan = true;
const endpoint = '/api/scan/mock';
```

**Features**:
- ✅ No ESP32 required
- ✅ Fast (~3 seconds)
- ✅ Random plant detection (70% probability)
- ✅ Random confidence scores (60-95%)
- ✅ Perfect for UI/UX testing

### Real Mode (With ESP32):
```typescript
const useMockScan = false;
const endpoint = '/api/scan/start';
```

**Features**:
- ⚙️ Requires ESP32-CAM connected
- ⚙️ Moves physical rail motor
- ⚙️ Takes ~30-60 seconds
- ⚙️ Real image analysis
- ⚙️ Actual plant detection

---

## Switching Between Modes

### In Frontend App:
Edit `shelves-identification.tsx`:
```typescript
// Line 60-61
const useMockScan = true;  // Change to false for real ESP32
const endpoint = useMockScan ? '/api/scan/mock' : '/api/scan/start';
```

### API Endpoints:
- **Mock**: `POST /api/scan/mock`
- **Real**: `POST /api/scan/start`

---

## Troubleshooting

### ❌ "Backend not responding"
**Solution**: Make sure backend is running:
```bash
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### ❌ "Scan Failed"
**Possible causes**:
- Backend not running
- Wrong API URL (check `services/api.ts`)
- CORS issues (should be enabled in backend)

**Check backend logs** for errors

### ❌ Results not updating in app
**Solution**:
- Check console for errors (`console.log` in handleScan)
- Verify API response format
- Ensure state update is triggered

---

## Expected Backend Logs

When running mock scan:
```
🧪 Starting MOCK shelf scan (simulation mode)
📍 [MOCK] Scanning Shelf 01 - top-right
📍 [MOCK] Scanning Shelf 01 - top-center
📍 [MOCK] Scanning Shelf 01 - top-left
  ✅ Result: Growing (Confidence: 78.4%)
📍 [MOCK] Scanning Shelf 02 - mid-right
📍 [MOCK] Scanning Shelf 02 - mid-center
📍 [MOCK] Scanning Shelf 02 - mid-left
  ⚪ Result: Empty (Confidence: 0.0%)
📍 [MOCK] Scanning Shelf 03 - bot-right
📍 [MOCK] Scanning Shelf 03 - bot-center
📍 [MOCK] Scanning Shelf 03 - bot-left
  ✅ Result: Mature (Confidence: 91.2%)
🏠 [MOCK] Returning to home position...
✅ [MOCK] Scan complete! Found plants on 2 shelf(s)
```

---

## Next Steps

1. **Test with simulation** ✅ (You're here!)
2. **Connect ESP32 devices** → WebSocket connection
3. **Test real scanning** → Change to `useMockScan = false`
4. **Calibrate movement** → Adjust `move_duration` in scan_service.py
5. **Tune detection** → Adjust HSV color ranges for better accuracy

---

## Additional Tests

### Test Multiple Scans:
Run the script 5 times to see variety:
```bash
for ($i=1; $i -le 5; $i++) { 
    Write-Host "`n=== Scan $i ===`n"
    .\test-scan.ps1 
}
```

### Compare Results:
Check generated JSON files to see randomization:
```
scan_results_2026-02-04_15-30-45.json
scan_results_2026-02-04_15-31-12.json
scan_results_2026-02-04_15-31-38.json
```

### Performance Test:
Measure response time:
```powershell
Measure-Command { Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/scan/mock" -Method Post }
```

Expected: ~3 seconds (mock mode)

---

## Summary

✅ **Mock mode works perfectly for development**  
✅ **No hardware needed for UI testing**  
✅ **Random results help test edge cases**  
✅ **Easy to switch to real mode later**

Happy testing! 🚀
