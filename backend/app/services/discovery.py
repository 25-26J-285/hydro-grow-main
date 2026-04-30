import socket
import threading
from zeroconf import ServiceInfo, Zeroconf

API_PORT = 8000  # Configured Port
UDP_PORT = 12345

def run_discovery_service():
    """Combined UDP + mDNS Discovery Service for ESP32 auto-discovery"""
    # Start UDP discovery in a thread
    udp_thread = threading.Thread(target=_run_udp_discovery, daemon=True)
    udp_thread.start()
    
    # Start mDNS discovery (blocks)
    _run_mdns_discovery()

def _run_udp_discovery():
    """UDP Discovery Service for ESP32 auto-discovery (legacy)"""
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

def _run_mdns_discovery():
    """mDNS (Bonjour/Avahi) Discovery Service for WebSocket endpoints"""
    try:
        # Get local IP
        local_ip = _get_local_ip()
        hostname = socket.gethostname()
        
        # Create mDNS service info for Hydro Grow API
        service_name = "Hydro Grow API"
        service_type = "_hydrogrow._tcp.local."
        service_full_name = f"{service_name}._hydrogrow._tcp.local."
        
        # Properties advertise WebSocket endpoints
        properties = {
            "version": "1.0.0",
            "ws_stationary": f"ws://{local_ip}:{API_PORT}/ws/stationary",
            "ws_mobile": f"ws://{local_ip}:{API_PORT}/ws/mobile",
            "api_docs": f"http://{local_ip}:{API_PORT}/docs",
            "health": f"http://{local_ip}:{API_PORT}/healthz",
        }
        
        service_info = ServiceInfo(
            service_type,
            service_full_name,
            addresses=[socket.inet_aton(local_ip)],
            port=API_PORT,
            properties=properties,
            server=f"{hostname}.local.",
        )
        
        # Register the service
        zeroconf = Zeroconf()
        zeroconf.register_service(service_info)
        print(f"[mDNS] Registered 'Hydro Grow API' on {local_ip}:{API_PORT}")
        print(f"[mDNS] WebSocket endpoints:")
        print(f"  - Stationary: ws://{local_ip}:{API_PORT}/ws/stationary")
        print(f"  - Mobile: ws://{local_ip}:{API_PORT}/ws/mobile")
        print(f"[mDNS] Clients can discover this service via mDNS/Bonjour/Avahi")
        
        # Keep the service running
        try:
            while True:
                threading.Event().wait(3600)  # Sleep for 1 hour
        except KeyboardInterrupt:
            zeroconf.unregister_service(service_info)
            zeroconf.close()
    except Exception as e:
        print(f"[mDNS] Registration failed: {e}")
        import traceback
        traceback.print_exc()

def _get_local_ip():
    """Get the local IP address (not 127.0.0.1)"""
    try:
        # Create a socket to find the local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        # Fallback to localhost if we can't determine
        return "127.0.0.1"
