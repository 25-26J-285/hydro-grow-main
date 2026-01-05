from flask import Flask, request, Response
import numpy as np
import cv2
import threading

app = Flask(__name__)

# --- CONFIGURATION (MUST MATCH ESP32) ---
# If you used FRAMESIZE_VGA in ESP32, use 480, 640
# If you used FRAMESIZE_QVGA, use 240, 320
HEIGHT = 480 
WIDTH = 640

# Global variable to store the latest frame
global_frame = None
lock = threading.Lock()

def process_image(raw_data):
    """Converts raw RGB565 bytes to a JPEG image with BYTE SWAP fix"""
    try:
        # 1. Check size safety
        expected_size = WIDTH * HEIGHT * 2
        if len(raw_data) != expected_size:
            print(f"Warning: Incomplete packet. Expected {expected_size}, got {len(raw_data)}")
            return None

        # 2. Create numpy array from raw bytes
        img_array = np.frombuffer(raw_data, dtype=np.uint8)
        
        # 3. Reshape to (Height, Width, 2 bytes per pixel)
        img_raw = img_array.reshape((HEIGHT, WIDTH, 2))
        
        # --- THE FIX: SWAP THE BYTES ---
        # We flip the byte order: [Byte1, Byte2] -> [Byte2, Byte1]
        img_raw = img_raw[..., ::-1] 
        
        # 4. Convert RGB565 -> BGR (Standard Color for OpenCV)
        img_bgr = cv2.cvtColor(img_raw, cv2.COLOR_BGR5652BGR)
        
        # 5. Encode to JPEG for the browser
        ret, jpeg = cv2.imencode('.jpg', img_bgr)
        if ret:
            return jpeg.tobytes()
    except Exception as e:
        print(f"Error processing image: {e}")
    return None

@app.route('/upload', methods=['POST'])
def upload_image():
    global global_frame
    raw_data = request.data
    
    # Process the raw data into a viewable JPEG
    jpeg_bytes = process_image(raw_data)
    
    if jpeg_bytes:
        with lock:
            global_frame = jpeg_bytes
        return "Image Received", 200
    else:
        return "Image Corrupt", 400

def generate_frames():
    """Generator function that streams images to browser"""
    while True:
        with lock:
            if global_frame is None:
                continue
            current_frame = global_frame
            
        # Yield the frame in MJPEG format
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + current_frame + b'\r\n')

@app.route('/')
def index():
    """Video streaming home page."""
    return """
    <html>
      <head>
        <title>ESP32 Live Stream</title>
        <style>
          body { background-color: #222; color: white; text-align: center; font-family: sans-serif; }
          img { border: 5px solid #444; margin-top: 20px; max-width: 100%; }
        </style>
      </head>
      <body>
        <h1>ESP32 Live Feed</h1>
        <p>Receiving 1 image every 5 seconds</p>
        <img src="/video_feed">
      </body>
    </html>
    """

@app.route('/video_feed')
def video_feed():
    """Video streaming route. Put this in the src attribute of an img tag."""
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    # 0.0.0.0 allows the ESP32 (and other devices) to connect
    app.run(host='0.0.0.0', port=5000, debug=False)