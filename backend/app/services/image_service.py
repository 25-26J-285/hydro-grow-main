import numpy as np
import cv2
import threading

# Global frame storage
global_frame = None
frame_lock = threading.Lock()

# Supported RGB565 frame sizes: (width, height)
SUPPORTED_SIZES = [
    (320, 240),   # QVGA
    (640, 480),   # VGA
    (800, 600),   # SVGA
    (1024, 768),  # XGA
]

def _detect_frame_size(data_len: int):
    """Detect frame dimensions from raw byte length (width * height * 2 for RGB565)"""
    for w, h in SUPPORTED_SIZES:
        if data_len == w * h * 2:
            return w, h
    return None, None

def process_rgb565(raw_data: bytes):
    """Process RGB565 frame from ESP32-CAM with color correction"""
    try:
        img_array = np.frombuffer(raw_data, dtype=np.uint8)
        width, height = _detect_frame_size(len(img_array))
        if width is None:
            print(f"[Camera] Unknown frame size: {len(img_array)} bytes")
            return None

        img_raw = img_array.reshape((height, width, 2))
        img_raw = img_raw[..., ::-1]  # Swap Bytes (Endian Fix)
        img_bgr = cv2.cvtColor(img_raw, cv2.COLOR_BGR5652BGR)
        ret, jpeg = cv2.imencode('.jpg', img_bgr)
        return jpeg.tobytes() if ret else None
    except Exception as e:
        print(f"[Camera] Frame processing error: {e}")
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
