#!/usr/bin/env python3

import pymysql
import os

# Database credentials
DB_HOST = 'localhost'
DB_USER = 'markazte_aliyaghobi'
DB_PASSWORD = '@Yaghobi09'
DB_NAME = 'markazte_markaztech'
DB_PORT = 3306

print("Testing database connection...")
print(f"Host: {DB_HOST}")
print(f"User: {DB_USER}")
print(f"Database: {DB_NAME}")
print(f"Port: {DB_PORT}")
print("-" * 40)

try:
    # Test connection
    connection = pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        port=DB_PORT,
        charset='utf8mb4'
    )
    
    print("✓ Connection successful!")
    
    # Test query
    with connection.cursor() as cursor:
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()[0]
        print(f"Database version: {version}")
        
        cursor.execute("SELECT DATABASE()")
        db_name = cursor.fetchone()[0]
        print(f"Connected to database: {db_name}")
        
        cursor.execute("SELECT USER()")
        user = cursor.fetchone()[0]
        print(f"Connected as user: {user}")
        
        # Test table creation
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS test_table (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100)
            )
        """)
        print("✓ Test table created successfully")
        
        # Clean up
        cursor.execute("DROP TABLE test_table")
        print("✓ Test table dropped successfully")
    
    connection.close()
    print("\n🎉 Database connection test PASSED!")
    print("You can now run: python manage.py migrate")
    
except pymysql.Error as e:
    print(f"✗ Database connection FAILED: {e}")
    print("\nTroubleshooting:")
    print("1. Check if database 'markazte_markaztech' exists in cPanel")
    print("2. Check if user 'markazte_aliyaghobi' has access to the database")
    print("3. Verify the password is correct")
    print("4. Make sure MySQL/MariaDB service is running")
    
except Exception as e:
    print(f"✗ Unexpected error: {e}")