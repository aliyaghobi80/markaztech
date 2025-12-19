from rest_framework import serializers
from .models import Product, Category, Comment, Favorite
from django.contrib.auth import get_user_model

User = get_user_model()

class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model with nested children for mega menu."""
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon', 'children']

    def get_children(self, obj):
        children = obj.children.filter(is_active=True)
        return CategorySerializer(children, many=True).data

class CommentSerializer(serializers.ModelSerializer):
    """Serializer for product comments."""
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_mobile = serializers.CharField(source='user.mobile', read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'product', 'product_title', 'user', 'user_name', 'user_mobile', 'content', 'rating', 'parent', 'replies', 'is_approved', 'created_at']
        read_only_fields = ['id', 'user', 'is_approved', 'created_at']

    def get_replies(self, obj):
        # Only return approved replies
        approved_replies = obj.replies.filter(is_approved=True)
        return CommentSerializer(approved_replies, many=True).data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class FavoriteSerializer(serializers.ModelSerializer):
    """Serializer for user favorites."""
    product_details = serializers.SerializerMethodField()

    class Meta:
        model = Favorite
        fields = ['id', 'product', 'product_details', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_product_details(self, obj):
        return {
            'id': obj.product.id,
            'title': obj.product.title,
            'slug': obj.product.slug,
            'price': obj.product.price,
            'discount_price': obj.product.discount_price,
            'main_image': self.context['request'].build_absolute_uri(obj.product.main_image.url) if obj.product.main_image else None
        }

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model with category details and approved comments."""
    category = serializers.SerializerMethodField()
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    comments = serializers.SerializerMethodField()
    is_favorite = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'description', 
            'price', 'discount_price', 'main_image', 
            'delivery_time', 'category', 'category_slug', 'is_active',
            'comments', 'is_favorite'
        ]
    
    def get_category(self, obj):
        if obj.category:
            return {
                'id': obj.category.id,
                'name': obj.category.name,
                'slug': obj.category.slug
            }
        return None

    def get_comments(self, obj):
        approved_comments = obj.comments.filter(is_approved=True, parent__isnull=True)
        return CommentSerializer(approved_comments, many=True, context=self.context).data

    def get_is_favorite(self, obj):
        user = self.context.get('request').user if 'request' in self.context else None
        if user and user.is_authenticated:
            return Favorite.objects.filter(user=user, product=obj).exists()
        return False


class UpdateProductSerializer(serializers.ModelSerializer):
    """Serializer for updating products."""
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), required=False)

    class Meta:
        model = Product
        fields = ['title', 'slug', 'description', 'price', 'discount_price', 'main_image', 'delivery_time', 'category', 'is_active']

    def to_internal_value(self, data):
        if hasattr(data, 'dict'):
            data = data.dict()
        else:
            data = data.copy() if hasattr(data, 'copy') else dict(data)

        if 'is_active' in data:
            if isinstance(data['is_active'], str):
                data['is_active'] = data['is_active'].lower() == 'true'
        
        if 'category' in data and data['category'] == '':
            data.pop('category')
            
        if 'discount_price' in data and data['discount_price'] == '':
            data['discount_price'] = None

        return super().to_internal_value(data)

    def to_representation(self, instance):
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
        model = Product
        fields = [
            'title', 'description', 'price', 'discount_price', 
            'main_image', 'delivery_time', 'category'
        ]
    
    def to_internal_value(self, data):
        if hasattr(data, 'dict'):
            data = data.dict()
        else:
            data = data.copy() if hasattr(data, 'copy') else dict(data)
            
        return super().to_internal_value(data)

    def create(self, validated_data):
        from django.utils.text import slugify
        
        title = validated_data['title']
        base_slug = slugify(title, allow_unicode=True)
        slug = base_slug
        counter = 1
        
        while Product.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        validated_data['slug'] = slug
        
        return super().create(validated_data)
