import django
import os
import sys

# Set up Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product, Category

def check_and_test():
    p = Product.objects.first()
    if not p:
        print("No products found")
        return
    
    print(f"Product: ID={p.id}, Title='{p.title}', CategoryID={p.category_id}, CategoryName='{p.category.name if p.category else 'None'}'")
    
    c = Category.objects.exclude(id=p.category_id).first()
    if not c:
        print("No other category found for testing")
        return
        
    print(f"Trying to update product {p.id} to Category: ID={c.id}, Name='{c.name}'")
    
    p.category = c
    p.save()
    
    p.refresh_from_db()
    print(f"After update: CategoryID={p.category_id}, CategoryName='{p.category.name if p.category else 'None'}'")
    
    if p.category_id == c.id:
        print("Update SUCCESSFUL in database")
    else:
        print("Update FAILED in database")

if __name__ == "__main__":
    check_and_test()
