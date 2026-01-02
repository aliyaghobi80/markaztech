#!/usr/bin/env python3
"""
ASGI entrypoint for Passenger (Channels/WebSocket compatible).
Passenger will import `application` from this file.
"""

import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

from config.asgi import application  # noqa: E402
