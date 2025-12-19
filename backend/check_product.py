import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product

p = Product.objects.get(id=5)
print(f"Product: {p.title}")
print(f"Category: {p.category.name if p.category else None}")
print(f"Category ID: {p.category_id}")
