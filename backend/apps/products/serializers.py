from rest_framework import serializers
from .models import Product, Category, Comment, Favorite
from django.contrib.auth import get_user_model

User = get_user_model()

class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model with nested children for mega menu."""
    children = serializers.SerializerMethodField()
    parent_name = serializers.CharField(source='parent.name', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon', 'parent', 'parent_name', 'children', 'is_active']

    def get_children(self, obj):
        # Return children only if requested or limit depth
        children = obj.children.all()
        return CategorySerializer(children, many=True, context=self.context).data

    def to_internal_value(self, data):
        # Convert QueryDict to a mutable dict if necessary
        if hasattr(data, 'copy'):
            data = data.copy()
        
        # Handle empty strings for nullable fields
        if 'parent' in data and (data['parent'] == '' or data['parent'] == 'null'):
            data['parent'] = None
            
        # Handle Boolean strings from FormData
        if 'is_active' in data:
            if isinstance(data['is_active'], str):
                data['is_active'] = data['is_active'].lower() == 'true'
                
        return super().to_internal_value(data)

class CommentSerializer(serializers.ModelSerializer):
    """Serializer for product comments."""
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_mobile = serializers.CharField(source='user.mobile', read_only=True)
    user_is_staff = serializers.BooleanField(source='user.is_staff', read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True)
    replies = serializers.SerializerMethodField()
    created_at_human = serializers.SerializerMethodField()
    created_at_full = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'product', 'product_title', 'user', 'user_name', 'user_mobile', 'user_is_staff', 'content', 'rating', 'parent', 'replies', 'is_approved', 'created_at', 'created_at_human', 'created_at_full']
        read_only_fields = ['id', 'user', 'is_approved', 'created_at']

    def get_created_at_human(self, obj):
        from apps.users.utils import jalali_relative_time
        return jalali_relative_time(obj.created_at)

    def get_created_at_full(self, obj):
        from apps.users.utils import jalali_full_date
        return jalali_full_date(obj.created_at)

    def get_replies(self, obj):
        request = self.context.get('request')
        user = request.user if request else None
        
        # Determine which replies to show
        if user and user.is_authenticated:
            if user.is_staff:
                replies = obj.replies.all()
            else:
                replies = obj.replies.filter(Q(is_approved=True) | Q(user=user))
        else:
            replies = obj.replies.filter(is_approved=True)
            
        return CommentSerializer(replies.order_by('created_at'), many=True, context=self.context).data

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
    created_at_human = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'description', 
            'price', 'discount_price', 'main_image', 
            'delivery_time', 'stock', 'category', 'category_slug', 'is_active',
            'comments', 'is_favorite', 'created_at_human', 'show_in_hero'
        ]
    
    def get_created_at_human(self, obj):
        from apps.users.utils import jalali_relative_time
        return jalali_relative_time(obj.created_at)
    
    def get_category(self, obj):
        if obj.category:
            return {
                'id': obj.category.id,
                'name': obj.category.name,
                'slug': obj.category.slug
            }
        return None

    def get_comments(self, obj):
        request = self.context.get('request')
        user = request.user if request else None
        
        # Determine which comments to show
        if user and user.is_authenticated:
            if user.is_staff:
                comments = obj.comments.filter(parent__isnull=True)
            else:
                comments = obj.comments.filter(Q(is_approved=True) | Q(user=user), parent__isnull=True)
        else:
            comments = obj.comments.filter(is_approved=True, parent__isnull=True)
            
        return CommentSerializer(comments, many=True, context=self.context).data

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
        fields = ['title', 'slug', 'description', 'price', 'discount_price', 'main_image', 'delivery_time', 'stock', 'category', 'is_active', 'show_in_hero']

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
            'main_image', 'delivery_time', 'stock', 'category', 'show_in_hero'
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
