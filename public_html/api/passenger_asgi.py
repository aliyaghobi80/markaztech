#!/usr/bin/env python3
"""
ASGI config for cPanel deployment with WebSocket support
"""

import os
import sys
from pathlib import Path

# Add the project directory to the sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Import Django and setup
import django
django.setup()

# Import ASGI application
from config.asgi import application

# Export for cPanel
app = application