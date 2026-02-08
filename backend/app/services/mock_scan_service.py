"""
Mock Scanning Service for Testing
Simulates ESP32-CAM shelf scanning without hardware
"""
import asyncio
import random
from datetime import datetime

# Mock scan state
mock_scan_state = {
    "is_scanning": False,
    "progress": 0,
    "current_position": None,
}


async def simulate_shelf_scan():
    """
    Simulate the scanning process with mock data
    No ESP32 hardware required - for testing only
    """
    global mock_scan_state
    
    if mock_scan_state["is_scanning"]:
        return {"success": False, "message": "Scan already in progress"}
    
    mock_scan_state["is_scanning"] = True
    mock_scan_state["progress"] = 0
    
    print("🧪 Starting MOCK shelf scan (simulation mode)")
    
    try:
        # Define 3 shelves with randomized plant detection
        shelves_data = []
        
        # Simulate scanning 9 positions (3 per shelf)
        positions = [
            "top-right", "top-center", "top-left",
            "mid-right", "mid-center", "mid-left", 
            "bot-right", "bot-center", "bot-left"
        ]
        
        for idx, position in enumerate(positions):
            shelf_id = (idx // 3) + 1  # Shelf 1, 2, or 3
            
            mock_scan_state["current_position"] = position
            mock_scan_state["progress"] = int(((idx + 1) / len(positions)) * 100)
            
            print(f"📍 [MOCK] Scanning Shelf {shelf_id:02d} - {position}")
            
            # Simulate movement and capture delay
            await asyncio.sleep(0.5)
        
        # Generate mock results for 3 shelves
        for shelf_id in range(1, 4):
            # Randomize plant detection (70% chance of having a plant)
            has_plant = random.random() < 0.7
            
            if has_plant:
                # Random confidence between 60-95%
                confidence = random.uniform(60, 95)
                
                # Random stage based on confidence
                if confidence > 85:
                    stage = "Mature"
                elif confidence > 70:
                    stage = "Growing"
                else:
                    stage = "Seedling"
                
                plants_detected = random.randint(1, 3)
            else:
                confidence = 0
                stage = "Empty"
                plants_detected = 0
            
            shelf_result = {
                "shelf_id": shelf_id,
                "shelf_name": f"Shelf {shelf_id:02d}",
                "has_plant": has_plant,
                "positions_scanned": 3,
                "plants_detected": plants_detected,
                "avg_confidence": round(confidence, 2),
                "stage": stage,
                "status": "Growing" if has_plant else "Empty"
            }
            
            shelves_data.append(shelf_result)
            
            result_icon = "✅" if has_plant else "⚪"
            print(f"  {result_icon} Result: {stage} "
                  f"(Confidence: {confidence:.1f}%)")
        
        print("🏠 [MOCK] Returning to home position...")
        await asyncio.sleep(0.5)
        
        plants_found = len([s for s in shelves_data if s["has_plant"]])
        print(f"✅ [MOCK] Scan complete! Found plants on {plants_found} shelf(s)")
        
        return {
            "success": True,
            "message": "Mock scan completed successfully",
            "shelves": shelves_data,
            "total_positions": len(positions),
            "scan_time": datetime.now().isoformat(),
            "is_simulation": True
        }
        
    except Exception as e:
        print(f"❌ [MOCK] Scan error: {e}")
        return {
            "success": False,
            "message": f"Mock scan failed: {str(e)}",
            "shelves": []
        }
    
    finally:
        mock_scan_state["is_scanning"] = False
        mock_scan_state["progress"] = 100
        mock_scan_state["current_position"] = None


def get_mock_scan_status():
    """Get current mock scan progress"""
    return {
        "is_scanning": mock_scan_state["is_scanning"],
        "progress": mock_scan_state["progress"],
        "current_position": mock_scan_state["current_position"],
        "is_simulation": True
    }
