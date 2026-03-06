import argparse
import requests
import json
import sys
from pathlib import Path
from typing import Optional

# Configuration
DEFAULT_BACKEND = "http://localhost:8000"

class APITester:
    def __init__(self, backend_url: str):
        self.backend_url = backend_url.rstrip('/')
    
    def test_germination_detection(
        self, 
        image_path: str, 
        confidence_threshold: float = 0.5
    ) -> dict:
        """Test germination detection endpoint"""
        print(f"\n📸 Testing Germination Detection")
        print(f"Backend: {self.backend_url}")
        print(f"Image: {image_path}")
        print(f"Confidence Threshold: {confidence_threshold}")
        
        try:
            with open(image_path, 'rb') as f:
                files = {'file': f}
                params = {'confidence_threshold': confidence_threshold}
                url = f"{self.backend_url}/api/detect-germination/mobile-camera"
                
                print(f"\n⏳ Sending request to {url}...")
                response = requests.post(url, files=files, params=params, timeout=30)
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"\n✅ Success! Response:")
                    print(json.dumps(result, indent=2))
                    
                    # Summary
                    print(f"\n📊 Summary:")
                    print(f"  • Germination Detected: {result.get('germination_detected', False)}")
                    print(f"  • Confidence: {result.get('confidence', 0):.2%}")
                    print(f"  • Stage: {result.get('stage', 'N/A')}")
                    print(f"  • Objects Found: {len(result.get('detected_objects', []))}")
                    print(f"  • Message: {result.get('message', 'N/A')}")
                    
                    return result
                else:
                    print(f"\n❌ Error: {response.status_code}")
                    print(f"Response: {response.text}")
                    return None
        
        except requests.exceptions.ConnectionError:
            print(f"\n❌ Connection Error: Cannot reach {self.backend_url}")
            print("   Make sure the backend is running:")
            print("   $ uvicorn app.main:app --host 0.0.0.0 --port 8000")
            return None
        except FileNotFoundError:
            print(f"\n❌ File not found: {image_path}")
            return None
        except Exception as e:
            print(f"\n❌ Error: {str(e)}")
            return None
    
    def test_rice_identification(self, image_path: str) -> dict:
        """Test rice identification endpoint"""
        print(f"\n🍚 Testing Rice Identification")
        print(f"Backend: {self.backend_url}")
        print(f"Image: {image_path}")
        
        try:
            with open(image_path, 'rb') as f:
                files = {'file': f}
                url = f"{self.backend_url}/api/predict-rice"
                
                print(f"\n⏳ Sending request to {url}...")
                response = requests.post(url, files=files, timeout=30)
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"\n✅ Success! Response:")
                    print(json.dumps(result, indent=2))
                    
                    # Summary
                    print(f"\n📊 Summary:")
                    print(f"  • Rice Type: {result.get('rice_type', 'N/A')}")
                    print(f"  • Type Confidence: {result.get('rice_type_confidence', 0):.2%}")
                    print(f"  • Quality: {result.get('rice_quality', 'N/A')}")
                    print(f"  • Quality Confidence: {result.get('rice_quality_confidence', 0):.2%}")
                    
                    if 'top_type_predictions' in result:
                        print(f"\n  Top Predictions:")
                        for pred in result['top_type_predictions'][:3]:
                            print(f"    - {pred['name']}: {pred['confidence']:.2%}")
                    
                    return result
                else:
                    print(f"\n❌ Error: {response.status_code}")
                    print(f"Response: {response.text}")
                    return None
        
        except requests.exceptions.ConnectionError:
            print(f"\n❌ Connection Error: Cannot reach {self.backend_url}")
            print("   Make sure the backend is running:")
            print("   $ uvicorn app.main:app --host 0.0.0.0 --port 8000")
            return None
        except FileNotFoundError:
            print(f"\n❌ File not found: {image_path}")
            return None
        except Exception as e:
            print(f"\n❌ Error: {str(e)}")
            return None
    
    def batch_test(self, image_dir: str, endpoint: str = 'germination') -> list:
        """Test multiple images in a directory"""
        image_dir = Path(image_dir)
        if not image_dir.exists():
            print(f"❌ Directory not found: {image_dir}")
            return []
        
        image_files = list(image_dir.glob('*.jpg')) + list(image_dir.glob('*.png'))
        
        if not image_files:
            print(f"❌ No image files found in {image_dir}")
            return []
        
        print(f"\n🎬 Batch Testing {len(image_files)} images")
        print(f"Endpoint: {endpoint}")
        
        results = []
        for idx, image_path in enumerate(image_files, 1):
            print(f"\n[{idx}/{len(image_files)}] Processing: {image_path.name}")
            
            if endpoint == 'germination':
                result = self.test_germination_detection(str(image_path))
            else:
                result = self.test_rice_identification(str(image_path))
            
            if result:
                results.append({
                    'image': image_path.name,
                    'result': result
                })
        
        return results

def main():
    parser = argparse.ArgumentParser(
        description='Test HydroGrow backend APIs with local images'
    )
    parser.add_argument(
        '--backend',
        type=str,
        default=DEFAULT_BACKEND,
        help=f'Backend URL (default: {DEFAULT_BACKEND})'
    )
    parser.add_argument(
        '--image',
        type=str,
        help='Path to image file for testing'
    )
    parser.add_argument(
        '--endpoint',
        type=str,
        choices=['germination', 'rice'],
        default='germination',
        help='Which endpoint to test (default: germination)'
    )
    parser.add_argument(
        '--confidence',
        type=float,
        default=0.5,
        help='Confidence threshold for germination detection (default: 0.5)'
    )
    parser.add_argument(
        '--batch',
        type=str,
        help='Directory containing multiple images to test'
    )
    parser.add_argument(
        '--health-check',
        action='store_true',
        help='Just check if backend is reachable'
    )
    
    args = parser.parse_args()
    
    tester = APITester(args.backend)
    
    # Health check
    if args.health_check:
        print(f"\n🏥 Backend Health Check: {args.backend}")
        try:
            response = requests.get(f"{args.backend}/docs", timeout=5)
            if response.status_code == 200:
                print("✅ Backend is healthy and responding")
            else:
                print(f"⚠️  Backend responded with status {response.status_code}")
        except requests.exceptions.ConnectionError:
            print(f"❌ Cannot connect to backend at {args.backend}")
            sys.exit(1)
        return
    
    # Single image test
    if args.image:
        if not Path(args.image).exists():
            print(f"❌ Image file not found: {args.image}")
            sys.exit(1)
        
        if args.endpoint == 'germination':
            tester.test_germination_detection(args.image, args.confidence)
        else:
            tester.test_rice_identification(args.image)
    
    # Batch test
    elif args.batch:
        results = tester.batch_test(args.batch, args.endpoint)
        print(f"\n\n📋 Batch Test Results: {len(results)} successful")
    
    else:
        parser.print_help()
        print("\n📝 Examples:")
        print(f"  Single image (germination):")
        print(f"    python test_local_images.py --image seed.jpg --endpoint germination")
        print(f"\n  Single image (rice):")
        print(f"    python test_local_images.py --image rice.jpg --endpoint rice")
        print(f"\n  Batch test:")
        print(f"    python test_local_images.py --batch ./test_images --endpoint germination")
        print(f"\n  Health check:")
        print(f"    python test_local_images.py --health-check")

if __name__ == '__main__':
    main()
