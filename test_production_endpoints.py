#!/usr/bin/env python3
"""
Test production endpoints to verify they're working
Run this after restarting Python App in cPanel
"""

import requests
import json

print("🔍 === Testing Production Endpoints ===")
print()

base_url = "https://markaztech.ir/api"

# Test endpoints that frontend is calling
endpoints_to_test = [
    "/",
    "/products/categories/",
    "/users/site-settings/",
    "/users/site-stats/",
    "/chat/admin-status/",
]

print("Testing API endpoints:")
for endpoint in endpoints_to_test:
    try:
        url = base_url + endpoint
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            print(f"   ✅ {endpoint}: Status {response.status_code}")
        elif response.status_code == 404:
            print(f"   ❌ {endpoint}: Status {response.status_code} (Not Found)")
        elif response.status_code == 301:
            print(f"   ⚠️ {endpoint}: Status {response.status_code} (Redirect)")
        else:
            print(f"   ⚠️ {endpoint}: Status {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ {endpoint}: Error - {e}")

# Test login endpoint
print("\n🔍 Testing login endpoint:")
login_data = {
    'mobile': 'admin',
    'password': 'MarkazTech2024!'
}

try:
    response = requests.post(
        f"{base_url}/users/login/",
        json=login_data,
        headers={'Content-Type': 'application/json'},
        timeout=10
    )
    
    print(f"   POST /users/login/: Status {response.status_code}")
    
    if response.status_code == 200:
        print(f"   ✅ Login working!")
        data = response.json()
        print(f"   User: {data.get('full_name', 'Unknown')}")
        print(f"   Admin: {data.get('is_admin', False)}")
    else:
        print(f"   Response: {response.text}")
        
except requests.exceptions.RequestException as e:
    print(f"   ❌ Login test failed: {e}")

# Test register endpoint
print("\n🔍 Testing register endpoint:")
register_data = {
    'mobile': '09999999999',  # Test number
    'password': 'test123456',
    'full_name': 'تست کاربر'
}

try:
    response = requests.post(
        f"{base_url}/users/register/",
        json=register_data,
        headers={'Content-Type': 'application/json'},
        timeout=10
    )
    
    print(f"   POST /users/register/: Status {response.status_code}")
    
    if response.status_code == 201:
        print(f"   ✅ Register working!")
        data = response.json()
        print(f"   User ID: {data.get('user_id', 'Unknown')}")
    elif response.status_code == 400:
        print(f"   ⚠️ Register validation error (expected for test)")
        data = response.json()
        if 'mobile' in data and 'already exists' in str(data['mobile']):
            print(f"   ✅ Mobile validation working (number already exists)")
    else:
        print(f"   Response: {response.text}")
        
except requests.exceptions.RequestException as e:
    print(f"   ❌ Register test failed: {e}")

print("\n" + "="*50)
print("🔍 Test complete!")
print()
print("Expected results after Python App restart:")
print("✅ All endpoints should return Status 200 (not 404)")
print("✅ Login should return Status 200 with JWT tokens")
print("✅ Register should return Status 201 or 400 (validation)")
print()
print("If you see 404 errors, Python App needs restart in cPanel!")