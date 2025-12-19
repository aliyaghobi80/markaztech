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
