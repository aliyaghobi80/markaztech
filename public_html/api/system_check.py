#!/usr/bin/env python3

import sys
import os
import subprocess

print("=== MarkazTech System Check ===")
print()

# Check Python version
print("1. Python Version:")
print(f"   {sys.version}")
print()

# Check current directory
print("2. Current Directory:")
print(f"   {os.getcwd()}")
print()

# Check if files exist
print("3. Required Files:")
files_to_check = [
    'manage.py',
    '.env',
    'config/settings.py',
    'config/__init__.py',
    'passenger_wsgi.py',
    'requirements-cpanel.txt'
]

for file in files_to_check:
    if os.path.exists(file):
        print(f"   ✓ {file}")
    else:
        print(f"   ✗ {file} (missing)")
print()

# Check if PyMySQL is installed
print("4. PyMySQL Installation:")
try:
    import pymysql
    print(f"   ✓ PyMySQL version: {pymysql.__version__}")
except ImportError:
    print("   ✗ PyMySQL not installed")
print()

# Check environment variables
print("5. Environment Variables (.env):")
if os.path.exists('.env'):
    with open('.env', 'r') as f:
        lines = f.readlines()
        for line in lines:
            if line.strip() and not line.startswith('#'):
                key = line.split('=')[0]
                print(f"   ✓ {key}")
else:
    print("   ✗ .env file not found")
print()

print("6. Virtual Environment:")
if 'VIRTUAL_ENV' in os.environ:
    print(f"   ✓ Virtual environment: {os.environ['VIRTUAL_ENV']}")
else:
    print("   ⚠ Virtual environment not detected")
print()

print("=== System Check Complete ===")
print()
print("Next steps:")
print("1. Run: python3 simple_db_test.py")
print("2. If database test passes, run: python manage.py migrate")
print("3. Then run: python manage.py collectstatic --noinput")