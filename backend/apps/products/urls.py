# مسیر: backend/apps/products/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CategoryViewSet, CommentViewSet, FavoriteViewSet

router = DefaultRouter()
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'favorites', FavoriteViewSet, basename='favorite')
router.register(r'', ProductViewSet, basename='product')

urlpatterns = [
    path('categories/', CategoryViewSet.as_view({'get': 'list'}), name='categories-list'),
    path('', include(router.urls)),
]
