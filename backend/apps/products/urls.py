# مسیر: backend/apps/products/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CategoryViewSet

router = DefaultRouter()
# این خط باعث می‌شود آدرس محصولات بشود: /api/products/
# و آدرس تکی بشود: /api/products/1/
router.register(r'', ProductViewSet, basename='product')

urlpatterns = [
    # 🚨 نکته مهم: این خط باید اول باشد!
    # اگر این پایین باشد، جنگو فکر می‌کند "categories" آی‌دی محصول است.
    path('categories/', CategoryViewSet.as_view({'get': 'list'}), name='categories-list'),

    # حالا روتر را اینکلود کن
    path('', include(router.urls)),
]