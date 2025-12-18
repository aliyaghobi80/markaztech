# مسیر: backend/apps/products/views.py

from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer, CreateProductSerializer

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
        
        # Try to get by ID first (for admin operations)
        if lookup_value.isdigit():
            try:
                return self.get_queryset().get(id=lookup_value)
            except Product.DoesNotExist:
                pass
        
        # Fall back to slug lookup
        try:
            return self.get_queryset().get(slug=lookup_value)
        except Product.DoesNotExist:
            from django.http import Http404
            raise Http404("Product not found")
    
    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action == 'create':
            return CreateProductSerializer
        return ProductSerializer
    
    # تعیین سطح دسترسی بر اساس نوع درخواست
    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS: # GET, HEAD, OPTIONS
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()] # برای حذف و اضافه فقط ادمین

    def get_queryset(self):
        # اگر ادمین بود همه را ببیند (حتی غیرفعال‌ها)
        if self.request.user.is_staff:
            return Product.objects.all().order_by('-created_at')

        # فیلتر برای کاربران عادی
        queryset = Product.objects.filter(is_active=True)
        
        # فیلتر بر اساس دسته‌بندی
        category_slug = self.request.query_params.get('category')
        if category_slug:
            try:
                category = Category.objects.get(slug=category_slug)
                # دریافت زیرمجموعه‌ها
                children = category.children.all()
                all_categories = [category] + list(children)
                queryset = queryset.filter(category__in=all_categories)
            except Category.DoesNotExist:
                return queryset.none()
        
        # فیلتر جستجو
        search_query = self.request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(category__name__icontains=search_query)
            )
            
        return queryset.order_by('-created_at')


class CategoryViewSet(viewsets.ModelViewSet):
    """
    مدیریت دسته‌بندی‌ها
    """
    queryset = Category.objects.filter(parent=None)
    serializer_class = CategorySerializer
    
    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]