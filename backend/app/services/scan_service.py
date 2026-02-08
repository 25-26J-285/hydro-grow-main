import asyncio
import cv2
import numpy as np
from datetime import datetime
from app.services.state_store import global_state
from app.services.image_service import frame_lock, global_frame

# Scanning state
scan_state = {
    "is_scanning": False,
    "progress": 0,
    "current_position": None,
    "results": []
}

# Define scanning positions (top-right to bottom-left)
# Assuming 3 shelves with 3 positions each
SCAN_POSITIONS = [
    # Top shelf (Shelf 1) - Right to Left
    {"shelf_id": 1, "name": "Shelf 01", "position": "top-right", "move_duration": 0},
    {"shelf_id": 1, "name": "Shelf 01", "position": "top-center", "move_duration": 2},
    {"shelf_id": 1, "name": "Shelf 01", "position": "top-left", "move_duration": 2},
    # Middle shelf (Shelf 2) - Right to Left
    {"shelf_id": 2, "name": "Shelf 02", "position": "mid-right", "move_duration": 2},
    {"shelf_id": 2, "name": "Shelf 02", "position": "mid-center", "move_duration": 2},
    {"shelf_id": 2, "name": "Shelf 02", "position": "mid-left", "move_duration": 2},
    # Bottom shelf (Shelf 3) - Right to Left
    {"shelf_id": 3, "name": "Shelf 03", "position": "bot-right", "move_duration": 2},
    {"shelf_id": 3, "name": "Shelf 03", "position": "bot-center", "move_duration": 2},
    {"shelf_id": 3, "name": "Shelf 03", "position": "bot-left", "move_duration": 2},
]


async def move_rail_and_wait(command_callback, direction: str, duration: float):
    """Move rail in direction and wait for specified duration"""
    if duration > 0:
        # Send movement command
        command = {"target": "stationary", "component": "rail", "action": direction}
        success = await command_callback(command)
        
        if success:
            # Wait for movement to complete
            await asyncio.sleep(duration)
            
            # Stop rail
            stop_command = {"target": "stationary", "component": "rail", "action": "STOP"}
            await command_callback(stop_command)
            
            # Wait for stabilization
            await asyncio.sleep(0.5)
        
        return success
    return True


def detect_plant_in_frame(frame_bytes: bytes) -> dict:
    """
    Analyze frame to detect if a plant is present
    Returns detection result with confidence and status
    """
    if not frame_bytes:
        return {"has_plant": False, "confidence": 0, "status": "No image"}
    
    try:
        # Decode JPEG frame
        nparr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return {"has_plant": False, "confidence": 0, "status": "Invalid image"}
        
        # Convert to HSV for green detection
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        # Define range for green color (plants)
        lower_green = np.array([35, 40, 40])
        upper_green = np.array([85, 255, 255])
        
        # Create mask for green areas
        mask = cv2.inRange(hsv, lower_green, upper_green)
        
        # Calculate percentage of green pixels
        green_percentage = (np.sum(mask > 0) / mask.size) * 100
        
        # Determine if plant is present (threshold: 5% green)
        has_plant = green_percentage > 5.0
        
        # Calculate confidence (0-100)
        confidence = min(green_percentage * 10, 100)
        
        # Estimate growth stage based on green area
        if green_percentage > 30:
            stage = "Mature"
        elif green_percentage > 15:
            stage = "Growing"
        elif green_percentage > 5:
            stage = "Seedling"
        else:
            stage = "Empty"
        
        return {
            "has_plant": has_plant,
            "confidence": round(confidence, 2),
            "green_percentage": round(green_percentage, 2),
            "stage": stage,
            "status": "Detected" if has_plant else "Empty"
        }
        
    except Exception as e:
        print(f"❌ Plant detection error: {e}")
        return {"has_plant": False, "confidence": 0, "status": f"Error: {str(e)}"}


async def start_shelf_scan(command_callback):
    """
    Start the scanning process
    Moves the mobile ESP32-CAM from top-right to bottom-left
    Captures and analyzes images at each position
    """
    global scan_state
    
    if scan_state["is_scanning"]:
        return {"success": False, "message": "Scan already in progress"}
    
    scan_state["is_scanning"] = True
    scan_state["progress"] = 0
    scan_state["results"] = []
    
    print("🔍 Starting shelf scan (Top-Right → Bottom-Left)")
    
    # Dictionary to store shelf-level results
    shelf_data = {}
    
    try:
        total_positions = len(SCAN_POSITIONS)
        
        for idx, position in enumerate(SCAN_POSITIONS):
            if not scan_state["is_scanning"]:
                break  # Allow cancellation
            
            shelf_id = position["shelf_id"]
            scan_state["current_position"] = position["position"]
            
            print(f"📍 Scanning {position['name']} - {position['position']}")
            
            # Move to position (except first position - already at top-right)
            if position["move_duration"] > 0:
                direction = "MOVE_LEFT"  # Always moving left in this scan pattern
                success = await move_rail_and_wait(
                    command_callback, 
                    direction, 
                    position["move_duration"]
                )
                
                if not success:
                    print(f"⚠️ Failed to move to {position['position']}")
            
            # Capture and analyze frame
            with frame_lock:
                current_frame = global_frame
            
            detection_result = detect_plant_in_frame(current_frame)
            
            # Store position result
            position_result = {
                "shelf_id": shelf_id,
                "shelf_name": position["name"],
                "position": position["position"],
                "timestamp": datetime.now().isoformat(),
                **detection_result
            }
            
            scan_state["results"].append(position_result)
            
            # Aggregate data per shelf
            if shelf_id not in shelf_data:
                shelf_data[shelf_id] = {
                    "shelf_id": shelf_id,
                    "shelf_name": position["name"],
                    "has_plant": False,
                    "positions_scanned": 0,
                    "plants_detected": 0,
                    "avg_confidence": 0,
                    "stage": "Empty",
                    "status": "Empty"
                }
            
            shelf_info = shelf_data[shelf_id]
            shelf_info["positions_scanned"] += 1
            
            if detection_result["has_plant"]:
                shelf_info["has_plant"] = True
                shelf_info["plants_detected"] += 1
                shelf_info["stage"] = detection_result["stage"]
                shelf_info["status"] = "Growing"
            
            # Update progress
            scan_state["progress"] = int(((idx + 1) / total_positions) * 100)
            
            print(f"  ✓ Result: {detection_result['status']} "
                  f"(Confidence: {detection_result['confidence']}%)")
            
            # Small delay between positions
            await asyncio.sleep(0.3)
        
        # Move back to home position (top-right)
        print("🏠 Returning to home position...")
        await move_rail_and_wait(command_callback, "MOVE_RIGHT", 12)  # Full traverse back
        
        # Calculate average confidence per shelf
        for shelf_info in shelf_data.values():
            relevant_results = [
                r for r in scan_state["results"] 
                if r["shelf_id"] == shelf_info["shelf_id"] and r["has_plant"]
            ]
            if relevant_results:
                shelf_info["avg_confidence"] = round(
                    sum(r["confidence"] for r in relevant_results) / len(relevant_results), 
                    2
                )
        
        # Convert to list sorted by shelf_id
        final_results = sorted(shelf_data.values(), key=lambda x: x["shelf_id"])
        
        print(f"✅ Scan complete! Found plants on {len([s for s in final_results if s['has_plant']])} shelves")
        
        return {
            "success": True,
            "message": "Scan completed successfully",
            "shelves": final_results,
            "total_positions": total_positions,
            "scan_time": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Scan error: {e}")
        return {
            "success": False,
            "message": f"Scan failed: {str(e)}",
            "shelves": []
        }
    
    finally:
        scan_state["is_scanning"] = False
        scan_state["progress"] = 100
        scan_state["current_position"] = None


def get_scan_status():
    """Get current scan progress"""
    return {
        "is_scanning": scan_state["is_scanning"],
        "progress": scan_state["progress"],
        "current_position": scan_state["current_position"],
        "results_count": len(scan_state["results"])
    }


def stop_scan():
    """Stop ongoing scan"""
    scan_state["is_scanning"] = False
    return {"success": True, "message": "Scan stopped"}
