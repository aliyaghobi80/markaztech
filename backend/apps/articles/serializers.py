from rest_framework import serializers
from .models import Article, ArticleComment
from django.db.models import Q

class ArticleCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_is_staff = serializers.BooleanField(source='user.is_staff', read_only=True)
    replies = serializers.SerializerMethodField()
    created_at_human = serializers.SerializerMethodField()

    class Meta:
        model = ArticleComment
        fields = ['id', 'article', 'user', 'user_name', 'user_is_staff', 'content', 'parent', 'replies', 'is_approved', 'created_at', 'created_at_human']
        read_only_fields = ['user', 'is_approved', 'created_at']

    def get_created_at_human(self, obj):
        from apps.users.utils import jalali_relative_time
        return jalali_relative_time(obj.created_at)

    def get_replies(self, obj):
        request = self.context.get('request')
        user = request.user if request else None
        
        if user and user.is_staff:
            replies = obj.replies.all()
        else:
            q = Q(is_approved=True)
            if user and user.is_authenticated:
                q |= Q(user=user)
            replies = obj.replies.filter(q)
            
        return ArticleCommentSerializer(replies.order_by('created_at'), many=True, context=self.context).data

class ArticleSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)
    created_at_human = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = ['id', 'title', 'slug', 'category', 'category_name', 'content', 'image', 'author', 'author_name', 'is_active', 'comments_count', 'created_at', 'created_at_human']
        read_only_fields = ['author', 'created_at']

    def to_internal_value(self, data):
        # Convert to mutable if it's a QueryDict
        if hasattr(data, 'copy'):
            data = data.copy()
        
        # Handle empty strings for nullable fields
        if 'category' in data and (data['category'] == '' or data['category'] == 'null'):
            data['category'] = None
        
        # Handle Boolean strings from FormData
        if 'is_active' in data:
            if isinstance(data['is_active'], str):
                data['is_active'] = data['is_active'].lower() == 'true'
        
        # Handle image field - if it's a string (existing URL), ignore it for validation
        if 'image' in data:
            val = data['image']
            if isinstance(val, str) or val is None or val == '' or val == 'null':
                data.pop('image')
        
        return super().to_internal_value(data)

    def get_created_at_human(self, obj):
        from apps.users.utils import jalali_relative_time
        return jalali_relative_time(obj.created_at)

class ArticleDetailSerializer(ArticleSerializer):
    comments = serializers.SerializerMethodField()

    class Meta(ArticleSerializer.Meta):
        fields = ArticleSerializer.Meta.fields + ['comments']

    def get_comments(self, obj):
        request = self.context.get('request')
        user = request.user if request else None
        
        if user and user.is_staff:
            comments = obj.comments.filter(parent__isnull=True)
        else:
            q = Q(is_approved=True)
            if user and user.is_authenticated:
                q |= Q(user=user)
            comments = obj.comments.filter(q, parent__isnull=True)
            
        return ArticleCommentSerializer(comments, many=True, context=self.context).data
