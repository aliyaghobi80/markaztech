from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q, ProtectedError
from .models import Product, Category, Comment, Favorite
from .serializers import (
    ProductSerializer, CategorySerializer, CreateProductSerializer, 
    UpdateProductSerializer, CommentSerializer, FavoriteSerializer
)

class ProductViewSet(viewsets.ModelViewSet):
    """
    مدیریت کامل محصولات.
    کاربران عادی فقط می‌بینند (GET).
    ادمین می‌تواند اضافه، ویرایش و حذف کند (POST, PATCH, DELETE).
    """
    serializer_class = ProductSerializer
    lookup_field = 'slug'
    
    def get_object(self):
        """Override to support both ID and slug lookup."""
        lookup_value = self.kwargs[self.lookup_field]
        
        if lookup_value.isdigit():
            try:
                return self.get_queryset().get(id=lookup_value)
            except Product.DoesNotExist:
                pass
        
        try:
            return self.get_queryset().get(slug=lookup_value)
        except Product.DoesNotExist:
            from django.http import Http404
            raise Http404("Product not found")
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateProductSerializer
        if self.action in ['update', 'partial_update']:
            return UpdateProductSerializer
        return ProductSerializer
    
    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Product.objects.all().order_by('-created_at')

        queryset = Product.objects.filter(is_active=True)
        category_slug = self.request.query_params.get('category')
        if category_slug:
            try:
                category = Category.objects.get(slug=category_slug)
                children = category.children.all()
                all_categories = [category] + list(children)
                queryset = queryset.filter(category__in=all_categories)
            except Category.DoesNotExist:
                return queryset.none()
        
        search_query = self.request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(category__name__icontains=search_query)
            )
        
        return queryset.order_by('-created_at')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            return Response(
                {"error": "این محصول در سفارشات استفاده شده و قابل حذف نیست. به جای حذف، آن را غیرفعال کنید."},
                status=status.HTTP_400_BAD_REQUEST
            )

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.filter(parent=None)
    serializer_class = CategorySerializer
    
    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Comment.objects.all()
        return Comment.objects.filter(Q(is_approved=True) | Q(user=self.request.user) if self.request.user.is_authenticated else Q(is_approved=True))

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        comment = self.get_object()
        comment.is_approved = True
        comment.save()
        # Trigger WebSocket update for real-time
        from apps.users.utils import send_comment_update
        send_comment_update(comment)
        return Response({'status': 'comment approved'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        comment = self.get_object()
        comment.is_approved = False
        comment.save()
        return Response({'status': 'comment rejected'})

class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        favorite, created = Favorite.objects.get_or_create(
            user=request.user,
            product_id=product_id
        )
        
        if not created:
            favorite.delete()
            return Response({'status': 'removed', 'is_favorite': False})
        
        return Response({'status': 'added', 'is_favorite': True})
