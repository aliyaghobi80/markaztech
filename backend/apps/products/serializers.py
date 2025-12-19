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
    """Serializer for updating products - allows is_active and category to be writable."""
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), required=False)

    class Meta:
        model = Product
        fields = ['title', 'slug', 'description', 'price', 'discount_price', 'main_image', 'delivery_time', 'category', 'is_active']

    def to_internal_value(self, data):
        """Handle string 'true'/'false' for is_active and ensure category is processed correctly."""
        # Create a mutable copy of the data if it's a QueryDict (from multipart/form-data)
        if hasattr(data, 'dict'):
            data = data.dict()
        else:
            data = data.copy() if hasattr(data, 'copy') else dict(data)

        # Convert string booleans for is_active
        if 'is_active' in data:
            if isinstance(data['is_active'], str):
                data['is_active'] = data['is_active'].lower() == 'true'
        
        # Ensure category is not an empty string if it's optional but provided
        if 'category' in data and data['category'] == '':
            data.pop('category')
            
        # Handle empty discount_price
        if 'discount_price' in data and data['discount_price'] == '':
            data['discount_price'] = None

        return super().to_internal_value(data)

    def to_representation(self, instance):
        """Return full category info after update."""
        ret = super().to_representation(instance)
        if instance.category:
            ret['category'] = {
                'id': instance.category.id,
                'name': instance.category.name,
                'slug': instance.category.slug
            }
        return ret


class CreateProductSerializer(serializers.ModelSerializer):
    """Serializer for creating new products."""
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), required=True)
    
    class Meta:
        """Meta configuration for CreateProductSerializer."""
        model = Product
        fields = [
            'title', 'description', 'price', 'discount_price', 
            'main_image', 'delivery_time', 'category'
        ]
    
    def to_internal_value(self, data):
        """Handle multipart/form-data strings."""
        if hasattr(data, 'dict'):
            data = data.dict()
        else:
            data = data.copy() if hasattr(data, 'copy') else dict(data)
            
        return super().to_internal_value(data)

    def create(self, validated_data):
        """Create product with automatic slug generation."""
        # ساخت slug خودکار از title
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
