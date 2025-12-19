import django
import os
import sys

# Add backend to path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product, Category

print("--- Current Products and Categories ---")
products = Product.objects.all()[:5]
for p in products:
    print(f"Product: ID={p.id}, Title='{p.title}', CategoryID={p.category_id}, CategoryName='{p.category.name if p.category else 'None'}'")

categories = Category.objects.all()[:5]
print("\n--- Categories ---")
for c in categories:
    print(f"Category: ID={c.id}, Name='{c.name}'")

# Try to update a product if there are at least two categories
if products.exists() and categories.count() >= 2:
    p = products[0]
    old_cat = p.category
    new_cat = categories[1] if categories[0] == old_cat else categories[0]
    
    print(f"\n--- Testing Update ---")
    print(f"Updating Product {p.id} from Category {old_cat.id} to {new_cat.id}")
    p.category = new_cat
    p.save()
    
    # Reload from DB
    p.refresh_from_db()
    print(f"Updated Product {p.id} CategoryID is now: {p.category_id}")
    
    # Revert back
    p.category = old_cat
    p.save()
    print(f"Reverted Product {p.id} back to CategoryID: {p.category_id}")
else:
    print("\nNot enough data to test update.")
