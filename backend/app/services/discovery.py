import socket
import threading

API_PORT = 8000  # Configured Port
UDP_PORT = 12345

def run_discovery_service():
    """UDP Discovery Service for ESP32 auto-discovery"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        sock.bind(('0.0.0.0', UDP_PORT))
        print(f"[Discovery] UDP listening on {UDP_PORT} (Advertising Port {API_PORT})")

        while True:
            try:
                data, addr = sock.recvfrom(1024)
                if data == b"HYDRO_DISCOVER":
                    # Send the Port dynamically!
                    response = f"HYDRO_SERVER_HERE:{API_PORT}"
                    sock.sendto(response.encode(), addr)
                    print(f"[Discovery] Hit from {addr} - Sent: {response}")
            except Exception as e:
                print(f"Discovery Error: {e}")
    except OSError as e:
        # Port already in use (probably from reloader)
        if e.errno == 10048:
            print(f"[Discovery] UDP port {UDP_PORT} already in use (reloader)")
        else:
            print(f"Discovery Service Error: {e}")
