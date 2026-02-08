# Test Script for Mock Data Simulation
# Tests both shelf scanning and sensor data generation without ESP32 hardware

Write-Host "🧪 HydroGrow Mock Data Test" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Backend URL
$BASE_URL = "http://127.0.0.1:8000"

Write-Host "Testing API Connection..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BASE_URL/api/state" -Method Get
    Write-Host "✅ Backend is running!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Backend not responding. Make sure the server is running!" -ForegroundColor Red
    Write-Host "   Run: uvicorn app.main:app --reload --host 127.0.0.1 --port 8000" -ForegroundColor Yellow
    exit
}

Write-Host "Starting Mock Scan..." -ForegroundColor Yellow
Write-Host "(Simulating ESP32-CAM movement from top-right to bottom-left)" -ForegroundColor Gray
Write-Host ""

try {
    # Start the mock scan
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/scan/mock" -Method Post
    
    if ($response.success) {
        Write-Host "✅ Scan completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Results:" -ForegroundColor Cyan
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
        
        foreach ($shelf in $response.shelves) {
            $icon = if ($shelf.has_plant) { "🌱" } else { "⚪" }
            $status = if ($shelf.has_plant) { "ACTIVE" } else { "EMPTY" }
            $statusColor = if ($shelf.has_plant) { "Green" } else { "Gray" }
            
            Write-Host ""
            Write-Host "$icon $($shelf.shelf_name)" -ForegroundColor White
            Write-Host "   Status: $status" -ForegroundColor $statusColor
            Write-Host "   Stage: $($shelf.stage)" -ForegroundColor White
            if ($shelf.has_plant) {
                Write-Host "   Confidence: $($shelf.avg_confidence)%" -ForegroundColor Yellow
                Write-Host "   Plants Detected: $($shelf.plants_detected)" -ForegroundColor White
            }
        }
        
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
        
        $totalShelves = $response.shelves.Count
        $activeShelves = ($response.shelves | Where-Object { $_.has_plant }).Count
        
        Write-Host ""
        Write-Host "Summary:" -ForegroundColor Cyan
        Write-Host "  Total Shelves Scanned: $totalShelves" -ForegroundColor White
        Write-Host "  Shelves with Plants: $activeShelves" -ForegroundColor Green
        Write-Host "  Empty Shelves: $($totalShelves - $activeShelves)" -ForegroundColor Gray
        Write-Host ""
        
        # Save results to JSON file
        $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
        $outputFile = "scan_results_$timestamp.json"
        $response | ConvertTo-Json -Depth 10 | Out-File $outputFile
        Write-Host "💾 Results saved to: $outputFile" -ForegroundColor Cyan
        
    } else {
        Write-Host "❌ Scan failed: $($response.message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error during scan: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "Test complete!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "  - Run this script multiple times to see different random results" -ForegroundColor Gray
Write-Host "  - Test mock sensors: curl -X POST http://localhost:8000/api/sensors/mock/start" -ForegroundColor Gray
Write-Host "  - Read sensor data: curl http://localhost:8000/api/sensor/temp" -ForegroundColor Gray
Write-Host "  - Check the backend terminal for detailed logs" -ForegroundColor Gray
Write-Host ""
