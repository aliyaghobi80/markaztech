import django_jalali
from django_jalali import db
try:
    from django_jalali.db import models
    print("Found django_jalali.db.models")
except ImportError as e:
    print(f"Could not import django_jalali.db.models: {e}")

print(f"django_jalali path: {django_jalali.__path__}")
import pkgutil
print(f"django_jalali modules: {[name for _, name, _ in pkgutil.iter_modules(django_jalali.__path__)]}")
if hasattr(db, "__path__"):
    print(f"django_jalali.db modules: {[name for _, name, _ in pkgutil.iter_modules(db.__path__)]}")
