import requests
import json

def test_patch():
    url = 'http://127.0.0.1:8000/api/products/1/'
    # Try updating category to 2
    data = {'category': 2}
    
    print(f"Sending PATCH to {url} with data: {data}")
    
    try:
        # We don't have a real token here, but the ViewSet might be protected.
        # However, let's see if we get a 403 or if it actually processes the data.
        response = requests.patch(url, data=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_patch()
