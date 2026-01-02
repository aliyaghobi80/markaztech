#!/usr/bin/env python3
"""
Check Django migrations status
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

from django.core.management import execute_from_command_line
from django.db import connection

def check_migrations():
    """Check migrations status"""
    
    print("=== Django Migrations Status ===")
    print()
    
    try:
        # Check database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM django_migrations")
            migration_count = cursor.fetchone()[0]
            print(f"✓ Database connected")
            print(f"✓ Applied migrations: {migration_count}")
        
        print()
        print("=== Migration Details ===")
        
        # Show migration status
        os.system("python manage.py showmigrations")
        
        print()
        print("=== Database Tables ===")
        
        # Show tables
        with connection.cursor() as cursor:
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            print(f"Total tables: {len(tables)}")
            for table in tables:
                print(f"  - {table[0]}")
        
        return True
        
    except Exception as e:
        print(f"✗ Error checking migrations: {e}")
        return False

if __name__ == "__main__":
    check_migrations()