#!/usr/bin/env python3
"""
Debug 301 redirects in API
"""

import os
import sys
import django
from pathlib import Path

# Setup Django
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from django.conf import settings
import json

print("🔍 === Debugging 301 Redirects ===")
print()

client = Client()

# Test different URL variations
urls_to_test = [
    '/api/',
    '/api/users/',
    '/api/users/register/',
    '/api/users/login/',
    # Without trailing slash
    '/api',
    '/api/users',
    '/api/users/register',
    '/api/users/login',
]

print("1. Testing URL variations...")
for url in urls_to_test:
    response = client.get(url)
    print(f"   GET {url}: Status {response.status_code}")
    if response.status_code == 301:
        location = response.get('Location', 'No location header')
        print(f"      → Redirects to: {location}")

# Test 2: Check Django settings that might cause redirects
print("\n2. Checking Django settings...")
print(f"   APPEND_SLASH: {getattr(settings, 'APPEND_SLASH', 'Not set')}")
print(f"   SECURE_SSL_REDIRECT: {getattr(settings, 'SECURE_SSL_REDIRECT', 'Not set')}")
print(f"   USE_TZ: {getattr(settings, 'USE_TZ', 'Not set')}")

# Test 3: Test with different methods
print("\n3. Testing POST requests...")
test_data = {
    'username': 'testuser',
    'password': 'testpass123'
}

for url in ['/api/users/login/', '/api/users/login']:
    response = client.post(url, 
        data=json.dumps(test_data),
        content_type='application/json'
    )
    print(f"   POST {url}: Status {response.status_code}")
    if response.status_code == 301:
        location = response.get('Location', 'No location header')
        print(f"      → Redirects to: {location}")

# Test 4: Check if it's HTTPS redirect
print("\n4. Testing HTTPS redirect...")
response = client.get('/api/users/', HTTP_HOST='markaztech.ir', secure=False)
print(f"   HTTP request: Status {response.status_code}")
if response.status_code == 301:
    location = response.get('Location', 'No location header')
    print(f"      → Redirects to: {location}")

response = client.get('/api/users/', HTTP_HOST='markaztech.ir', secure=True)
print(f"   HTTPS request: Status {response.status_code}")

print("\n" + "="*50)
print("🔍 301 redirect debug complete!")
print("\nCommon causes of 301 redirects:")
print("1. APPEND_SLASH=True (Django adds trailing slash)")
print("2. SECURE_SSL_REDIRECT=True (Forces HTTPS)")
print("3. URL pattern mismatch")
print("4. Middleware redirecting requests")