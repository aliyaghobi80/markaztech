#!/usr/bin/env python3
"""
Create superuser for MarkazTech Django admin
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

from django.contrib.auth import get_user_model

User = get_user_model()

def create_superuser():
    """Create superuser if it doesn't exist"""
    
    # Default superuser credentials
    username = 'admin'
    email = 'admin@markaztech.ir'
    password = 'MarkazTech2024!'
    
    print("Creating superuser...")
    print(f"Username: {username}")
    print(f"Email: {email}")
    print(f"Password: {password}")
    print("-" * 40)
    
    try:
        # Check if superuser already exists
        if User.objects.filter(username=username).exists():
            print(f"⚠ Superuser '{username}' already exists!")
            user = User.objects.get(username=username)
            print(f"User ID: {user.id}")
            print(f"Email: {user.email}")
            print(f"Is active: {user.is_active}")
            print(f"Is staff: {user.is_staff}")
            print(f"Is superuser: {user.is_superuser}")
            return
        
        # Create superuser
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        
        print("✓ Superuser created successfully!")
        print(f"User ID: {user.id}")
        print(f"Username: {user.username}")
        print(f"Email: {user.email}")
        print()
        print("🎉 You can now login to admin panel:")
        print("URL: https://markaztech.ir/api/admin/")
        print(f"Username: {username}")
        print(f"Password: {password}")
        print()
        print("⚠ IMPORTANT: Change the password after first login!")
        
    except Exception as e:
        print(f"✗ Error creating superuser: {e}")
        return False
    
    return True

if __name__ == "__main__":
    create_superuser()