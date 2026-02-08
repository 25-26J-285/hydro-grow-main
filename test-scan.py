#!/usr/bin/env python3
"""
Test script for shelf scanning simulation
Tests the mock scan API without ESP32 hardware
"""

import requests
import json
from datetime import datetime
from colorama import init, Fore, Style

# Initialize colorama for Windows
init()

BASE_URL = "http://127.0.0.1:8000"

def print_header():
    print(f"\n{Fore.CYAN}🧪 HydroGrow Shelf Scanning Test{Style.RESET_ALL}")
    print(f"{Fore.CYAN}================================={Style.RESET_ALL}\n")

def test_connection():
    """Test if backend is running"""
    print(f"{Fore.YELLOW}Testing API Connection...{Style.RESET_ALL}")
    try:
        response = requests.get(f"{BASE_URL}/api/state")
        if response.status_code == 200:
            print(f"{Fore.GREEN}✅ Backend is running!{Style.RESET_ALL}\n")
            return True
    except requests.exceptions.ConnectionError:
        print(f"{Fore.RED}❌ Backend not responding!{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}   Make sure the server is running on {BASE_URL}{Style.RESET_ALL}")
        return False

def run_mock_scan():
    """Execute mock scan"""
    print(f"{Fore.YELLOW}Starting Mock Scan...{Style.RESET_ALL}")
    print(f"{Fore.WHITE}(Simulating ESP32-CAM movement from top-right to bottom-left){Style.RESET_ALL}\n")
    
    try:
        response = requests.post(f"{BASE_URL}/api/scan/mock")
        data = response.json()
        
        if data.get("success"):
            print(f"{Fore.GREEN}✅ Scan completed successfully!{Style.RESET_ALL}\n")
            display_results(data)
            save_results(data)
        else:
            print(f"{Fore.RED}❌ Scan failed: {data.get('message')}{Style.RESET_ALL}")
            
    except Exception as e:
        print(f"{Fore.RED}❌ Error during scan: {str(e)}{Style.RESET_ALL}")

def display_results(data):
    """Display scan results in a formatted way"""
    print(f"{Fore.CYAN}📊 Results:{Style.RESET_ALL}")
    print(f"{Fore.WHITE}{'━' * 50}{Style.RESET_ALL}")
    
    shelves = data.get("shelves", [])
    
    for shelf in shelves:
        icon = "🌱" if shelf.get("has_plant") else "⚪"
        status = "ACTIVE" if shelf.get("has_plant") else "EMPTY"
        status_color = Fore.GREEN if shelf.get("has_plant") else Fore.WHITE
        
        print(f"\n{icon} {shelf.get('shelf_name')}")
        print(f"   Status: {status_color}{status}{Style.RESET_ALL}")
        print(f"   Stage: {shelf.get('stage')}")
        
        if shelf.get("has_plant"):
            print(f"   {Fore.YELLOW}Confidence: {shelf.get('avg_confidence')}%{Style.RESET_ALL}")
            print(f"   Plants Detected: {shelf.get('plants_detected')}")
    
    print(f"\n{Fore.WHITE}{'━' * 50}{Style.RESET_ALL}\n")
    
    # Summary
    total = len(shelves)
    active = len([s for s in shelves if s.get("has_plant")])
    
    print(f"{Fore.CYAN}Summary:{Style.RESET_ALL}")
    print(f"  Total Shelves Scanned: {total}")
    print(f"  {Fore.GREEN}Shelves with Plants: {active}{Style.RESET_ALL}")
    print(f"  Empty Shelves: {total - active}")
    print()

def save_results(data):
    """Save results to JSON file"""
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"scan_results_{timestamp}.json"
    
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"{Fore.CYAN}💾 Results saved to: {filename}{Style.RESET_ALL}\n")

def main():
    print_header()
    
    if not test_connection():
        return
    
    run_mock_scan()
    
    print(f"{Fore.WHITE}{'━' * 50}{Style.RESET_ALL}")
    print(f"{Fore.GREEN}Test complete!{Style.RESET_ALL}\n")
    
    print(f"{Fore.YELLOW}💡 Tips:{Style.RESET_ALL}")
    print(f"{Fore.WHITE}  - Run this script multiple times to see different random results{Style.RESET_ALL}")
    print(f"{Fore.WHITE}  - Change 'useMockScan = true' to 'false' in the app to use real ESP32{Style.RESET_ALL}")
    print(f"{Fore.WHITE}  - Check the backend terminal for detailed logs{Style.RESET_ALL}\n")

if __name__ == "__main__":
    main()
