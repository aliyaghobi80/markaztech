import os
import sys
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.stdout.reconfigure(encoding='utf-8')
django.setup()

from apps.products.models import Product, Category
from apps.products.serializers import UpdateProductSerializer
from django.http import QueryDict

print("=== Before Update ===")
p = Product.objects.get(id=5)
print(f"Product: {p.title}, Category ID: {p.category_id}")

print("\n=== All Categories ===")
for c in Category.objects.all():
    print(f"  ID: {c.id}, Name: {c.name}")

print("\n=== Testing Update Serializer ===")
data = QueryDict(mutable=True)
data.update({
    'title': p.title,
    'slug': p.slug,
    'description': p.description,
    'price': str(p.price),
    'delivery_time': p.delivery_time,
    'category': '4',
    'is_active': 'true'
})

print(f"Input data: {dict(data)}")

serializer = UpdateProductSerializer(instance=p, data=data, partial=True)
if serializer.is_valid():
    print("Valid!")
    print(f"Validated data: {serializer.validated_data}")
    updated = serializer.save()
    print(f"Updated category ID: {updated.category_id}")
else:
    print(f"Errors: {serializer.errors}")

print("\n=== After Update ===")
p.refresh_from_db()
print(f"Product: {p.title}, Category ID: {p.category_id}")
