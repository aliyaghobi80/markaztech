#!/usr/bin/env python3
"""
Debug 500 error for MarkazTech cPanel deployment
"""

import os
import sys
import traceback
from pathlib import Path

print("🔍 === Debugging 500 Error ===")
print()

# Test 1: Basic Python imports
print("1. Testing basic Python imports...")
try:
    import django
    print(f"   ✅ Django {django.get_version()}")
except Exception as e:
    print(f"   ❌ Django import failed: {e}")

try:
    import pymysql
    print(f"   ✅ PyMySQL {pymysql.__version__}")
except Exception as e:
    print(f"   ❌ PyMySQL import failed: {e}")

# Test 2: Django setup
print("\n2. Testing Django setup...")
try:
    BASE_DIR = Path(__file__).resolve().parent
    sys.path.insert(0, str(BASE_DIR))
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    
    import django
    django.setup()
    print("   ✅ Django setup successful")
except Exception as e:
    print(f"   ❌ Django setup failed: {e}")
    traceback.print_exc()

# Test 3: Settings import
print("\n3. Testing settings import...")
try:
    from django.conf import settings
    print(f"   ✅ Settings loaded")
    print(f"   DEBUG: {settings.DEBUG}")
    print(f"   ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
except Exception as e:
    print(f"   ❌ Settings import failed: {e}")
    traceback.print_exc()

# Test 4: Database connection
print("\n4. Testing database connection...")
try:
    from django.db import connection
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
    print("   ✅ Database connection OK")
except Exception as e:
    print(f"   ❌ Database connection failed: {e}")

# Test 5: WSGI application
print("\n5. Testing WSGI application...")
try:
    from django.core.wsgi import get_wsgi_application
    application = get_wsgi_application()
    print("   ✅ WSGI application created")
except Exception as e:
    print(f"   ❌ WSGI application failed: {e}")
    traceback.print_exc()

# Test 6: URL patterns
print("\n6. Testing URL patterns...")
try:
    from django.urls import resolve
    from django.http import HttpRequest
    
    # Test root URL
    request = HttpRequest()
    request.method = 'GET'
    request.path = '/'
    
    print("   ✅ URL patterns accessible")
except Exception as e:
    print(f"   ❌ URL patterns failed: {e}")

# Test 7: Apps loading
print("\n7. Testing installed apps...")
try:
    from django.apps import apps
    installed_apps = apps.get_app_configs()
    print(f"   ✅ {len(installed_apps)} apps loaded:")
    for app in installed_apps:
        print(f"      - {app.name}")
except Exception as e:
    print(f"   ❌ Apps loading failed: {e}")
    traceback.print_exc()

print("\n" + "="*50)
print("🔍 Debug complete!")
print("\nIf you see any ❌ errors above, those need to be fixed.")
print("Common solutions:")
print("1. Check passenger_wsgi.py file")
print("2. Verify Python app settings in cPanel")
print("3. Check error logs: ~/logs/error_log")
print("4. Restart Python app in cPanel")