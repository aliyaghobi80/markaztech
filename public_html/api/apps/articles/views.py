from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from .models import Article, ArticleComment
from .serializers import ArticleSerializer, ArticleDetailSerializer, ArticleCommentSerializer

@method_decorator(never_cache, name='dispatch')
class ArticleViewSet(viewsets.ModelViewSet):
    lookup_field = 'slug'
    
    def get_object(self):
        """Override to support both ID and slug lookup."""
        lookup_value = self.kwargs[self.lookup_field]
        
        if lookup_value.isdigit():
            try:
                return self.get_queryset().get(id=lookup_value)
            except Article.DoesNotExist:
                pass
        
        try:
            return self.get_queryset().get(slug=lookup_value)
        except Article.DoesNotExist:
            from django.http import Http404
            raise Http404("Article not found")
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ArticleDetailSerializer
        return ArticleSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return Article.objects.all()
        return Article.objects.filter(is_active=True)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class ArticleCommentViewSet(viewsets.ModelViewSet):
    serializer_class = ArticleCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return ArticleComment.objects.all()
        q = Q(is_approved=True)
        if self.request.user.is_authenticated:
            q |= Q(user=self.request.user)
        return ArticleComment.objects.filter(q)

    def perform_create(self, serializer):
        user = self.request.user
        parent = serializer.validated_data.get('parent')
        is_approved = user.is_staff or parent is not None
        comment = serializer.save(user=user, is_approved=is_approved)
        
        if is_approved:
            from apps.users.utils import send_comment_update
            send_comment_update(comment)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        comment = self.get_object()
        comment.is_approved = True
        comment.save()
        from apps.users.utils import send_comment_update
        send_comment_update(comment)
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        comment = self.get_object()
        comment.is_approved = False
        comment.save()
        from apps.users.utils import send_comment_update
        send_comment_update(comment)
        return Response({'status': 'rejected'})
