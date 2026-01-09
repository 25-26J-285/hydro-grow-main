import numpy as np
import cv2
import threading

# Global frame storage
global_frame = None
frame_lock = threading.Lock()

# Camera configuration
HEIGHT = 240
WIDTH = 320

def process_rgb565(raw_data: bytes):
    """Process RGB565 frame from ESP32-CAM with color correction"""
    try:
        img_array = np.frombuffer(raw_data, dtype=np.uint8)
        if len(img_array) != WIDTH * HEIGHT * 2: 
            return None
        
        img_raw = img_array.reshape((HEIGHT, WIDTH, 2))
        img_raw = img_raw[..., ::-1]  # Swap Bytes (Endian Fix)
        img_bgr = cv2.cvtColor(img_raw, cv2.COLOR_BGR5652BGR)
        ret, jpeg = cv2.imencode('.jpg', img_bgr)
        return jpeg.tobytes() if ret else None
    except Exception as e:
        print(f"Frame processing error: {e}")
        return None

async def process_frame(image_bytes: bytes, format_type: str = "rgb565"):
    """Process camera frame and update global frame"""
    global global_frame
    
    if format_type == "rgb565":
        # Process RGB565 from ESP32-CAM
        jpeg = process_rgb565(image_bytes)
        if jpeg:
            with frame_lock:
                global_frame = jpeg
            return True
    else:
        # Process regular JPEG
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is not None:
            # TODO: Add YOLO Detection here later
            # detections = model(frame)
            
            # Save latest frame
            cv2.imwrite("static/latest_frame.jpg", frame)
            
            # Also encode to JPEG for streaming
            ret, jpeg = cv2.imencode('.jpg', frame)
            if ret:
                with frame_lock:
                    global_frame = jpeg.tobytes()
                return True
    
    return False

def get_current_frame():
    """Get the latest frame for streaming"""
    with frame_lock:
        return global_frame
