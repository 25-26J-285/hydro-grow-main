import asyncio
import threading
import numpy as np
import cv2

# Global frame storage
global_frame = None

# asyncio.Lock for async frame writers (process_frame)
_async_frame_lock = asyncio.Lock()
# threading.Lock for sync frame readers (get_current_frame called from generator)
_sync_frame_lock = threading.Lock()

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
    """Convert RGB565 bytes from ESP32-CAM to JPEG (pure conversion, no locking)"""
    try:
        img_array = np.frombuffer(raw_data, dtype=np.uint8)
        width, height = _detect_frame_size(len(img_array))
        if width is None:
            print(f"[Camera] Unknown frame size: {len(img_array)} bytes")
            return None
        img_raw = img_array.reshape((height, width, 2))
        img_raw = img_raw[..., ::-1]  # Endian byte-swap
        img_bgr = cv2.cvtColor(img_raw, cv2.COLOR_BGR5652BGR)
        ret, jpeg = cv2.imencode(".jpg", img_bgr)
        return jpeg.tobytes() if ret else None
    except Exception as e:
        print(f"[Camera] Frame processing error: {e}")
        return None


async def process_frame(image_bytes: bytes, format_type: str = "rgb565") -> bool:
    """Process camera frame and store as latest frame (async-safe)"""
    global global_frame

    if format_type == "rgb565":
        jpeg = process_rgb565(image_bytes)
    else:
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            return False
        ret, enc = cv2.imencode(".jpg", frame)
        jpeg = enc.tobytes() if ret else None

    if jpeg is None:
        return False

    async with _async_frame_lock:
        with _sync_frame_lock:
            global_frame = jpeg
    return True


def get_current_frame():
    """Return latest JPEG frame for streaming (sync-safe)"""
    with _sync_frame_lock:
        return global_frame
