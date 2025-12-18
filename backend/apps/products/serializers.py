# مسیر: backend/apps/products/serializers.py

from rest_framework import serializers
from .models import Product, Category

class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model with nested children for mega menu."""
    # این خط جادویی باعث می‌شود فرزندان هر دسته هم لیست شوند (برای مگا منو)
    children = serializers.SerializerMethodField()

    class Meta:
        """Meta configuration for CategorySerializer."""
        model = Category
        fields = ['id', 'name', 'slug', 'icon', 'children']

    def get_children(self, obj):
        """Get active children categories for hierarchical menu."""
        children = obj.children.filter(is_active=True)
        return CategorySerializer(children, many=True).data

class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model with category details."""
    category = serializers.SerializerMethodField()
    category_slug = serializers.CharField(source='category.slug', read_only=True)

    class Meta:
        """Meta configuration for ProductSerializer."""
        model = Product
        fields = [
            'id', 'title', 'slug', 'description', 
            'price', 'discount_price', 'main_image', 
            'delivery_time', 'category', 'category_slug', 'is_active'
        ]
    
    def get_category(self, obj):
        if obj.category:
            return {
                'id': obj.category.id,
                'name': obj.category.name,
                'slug': obj.category.slug
            }
        return None


class UpdateProductSerializer(serializers.ModelSerializer):
    """Serializer for updating products - allows is_active to be writable."""
    
    class Meta:
        model = Product
        fields = ['title', 'description', 'price', 'discount_price', 'main_image', 'delivery_time', 'is_active']


class CreateProductSerializer(serializers.ModelSerializer):
    """Serializer for creating new products."""
    category_slug = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        """Meta configuration for CreateProductSerializer."""
        model = Product
        fields = [
            'title', 'description', 'price', 'discount_price', 
            'main_image', 'delivery_time', 'category_slug'
        ]
    
    def create(self, validated_data):
        """Create product with category lookup by slug."""
        category_slug = validated_data.pop('category_slug', None)
        
        # اگر category_slug داده شده، دسته رو پیدا کن
        if category_slug:
            try:
                category = Category.objects.get(slug=category_slug)
                validated_data['category'] = category
            except Category.DoesNotExist:
                raise serializers.ValidationError({'category_slug': 'دسته‌بندی با این اسلاگ یافت نشد'})
        else:
            # اگر دسته‌بندی نداده شده، یک دسته پیش‌فرض انتخاب کن
            default_category = Category.objects.first()
            if default_category:
                validated_data['category'] = default_category
            else:
                raise serializers.ValidationError({'category': 'حداقل یک دسته‌بندی باید وجود داشته باشد'})
        
        # ساخت slug خودکار از title
        import re
        from django.utils.text import slugify
        
        title = validated_data['title']
        base_slug = slugify(title, allow_unicode=True)
        slug = base_slug
        counter = 1
        
        # اطمینان از یکتا بودن slug
        while Product.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        validated_data['slug'] = slug
        
        return super().create(validated_data)