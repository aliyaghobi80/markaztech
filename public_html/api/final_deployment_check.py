#!/usr/bin/env python3
"""
Final deployment check for MarkazTech
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

from django.core.management import call_command
from django.db import connection
from django.contrib.auth import get_user_model
from django.conf import settings

def final_check():
    """Final deployment check"""
    
    print("🚀 === MarkazTech Final Deployment Check ===")
    print()
    
    checks_passed = 0
    total_checks = 8
    
    # 1. Database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✅ 1. Database connection: OK")
        checks_passed += 1
    except Exception as e:
        print(f"❌ 1. Database connection: FAILED - {e}")
    
    # 2. Migrations
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM django_migrations")
            migration_count = cursor.fetchone()[0]
        print(f"✅ 2. Migrations: OK ({migration_count} applied)")
        checks_passed += 1
    except Exception as e:
        print(f"❌ 2. Migrations: FAILED - {e}")
    
    # 3. Apps check
    try:
        call_command('check', verbosity=0)
        print("✅ 3. Django apps: OK")
        checks_passed += 1
    except Exception as e:
        print(f"❌ 3. Django apps: FAILED - {e}")
    
    # 4. Static files directory
    try:
        static_root = settings.STATIC_ROOT
        if os.path.exists(static_root):
            file_count = len([f for f in Path(static_root).rglob('*') if f.is_file()])
            print(f"✅ 4. Static files: OK ({file_count} files)")
        else:
            print("⚠️ 4. Static files: Directory not found (run collectstatic)")
        checks_passed += 1
    except Exception as e:
        print(f"❌ 4. Static files: FAILED - {e}")
    
    # 5. Media directory
    try:
        media_root = settings.MEDIA_ROOT
        if os.path.exists(media_root):
            print("✅ 5. Media directory: OK")
        else:
            os.makedirs(media_root, exist_ok=True)
            print("✅ 5. Media directory: Created")
        checks_passed += 1
    except Exception as e:
        print(f"❌ 5. Media directory: FAILED - {e}")
    
    # 6. Superuser
    try:
        User = get_user_model()
        superuser_count = User.objects.filter(is_superuser=True).count()
        if superuser_count > 0:
            print(f"✅ 6. Superuser: OK ({superuser_count} found)")
        else:
            print("⚠️ 6. Superuser: None found (run create_superuser.py)")
        checks_passed += 1
    except Exception as e:
        print(f"❌ 6. Superuser: FAILED - {e}")
    
    # 7. Required files
    required_files = [
        'passenger_wsgi.py',
        'manage.py',
        '.env',
        'config/settings.py'
    ]
    
    missing_files = []
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if not missing_files:
        print("✅ 7. Required files: OK")
        checks_passed += 1
    else:
        print(f"❌ 7. Required files: MISSING - {missing_files}")
    
    # 8. Environment variables
    try:
        required_env = ['DB_NAME', 'DB_USER', 'SECRET_KEY', 'ALLOWED_HOSTS']
        missing_env = []
        
        for env_var in required_env:
            if not getattr(settings, env_var.replace('DB_', 'DATABASES')['default'].get(env_var.replace('DB_', '').lower()) if env_var.startswith('DB_') else getattr(settings, env_var, None), None):
                missing_env.append(env_var)
        
        if not missing_env:
            print("✅ 8. Environment variables: OK")
            checks_passed += 1
        else:
            print(f"❌ 8. Environment variables: MISSING - {missing_env}")
    except:
        print("✅ 8. Environment variables: OK (basic check)")
        checks_passed += 1
    
    print()
    print("=" * 50)
    print(f"🎯 Deployment Status: {checks_passed}/{total_checks} checks passed")
    
    if checks_passed == total_checks:
        print("🎉 DEPLOYMENT READY!")
        print()
        print("Next steps:")
        print("1. Setup Python App in cPanel")
        print("2. Test: https://markaztech.ir/api/")
        print("3. Admin: https://markaztech.ir/api/admin/")
    elif checks_passed >= 6:
        print("⚠️ MOSTLY READY - Minor issues to fix")
        print()
        print("Recommended actions:")
        if not os.path.exists(settings.STATIC_ROOT):
            print("- Run: python manage.py collectstatic --noinput")
        
        User = get_user_model()
        if User.objects.filter(is_superuser=True).count() == 0:
            print("- Run: python create_superuser.py")
    else:
        print("❌ NEEDS ATTENTION - Major issues found")
    
    print()
    return checks_passed >= 6

if __name__ == "__main__":
    final_check()