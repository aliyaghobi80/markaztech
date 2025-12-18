# مسیر: backend/apps/users/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, ProfileViewSet, CustomTokenObtainPairView, UserRegistrationView
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'list', UserViewSet, basename='user-management')

urlpatterns = [
    # Authentication endpoints
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile management
    path('profile/', ProfileViewSet.as_view({'get': 'me', 'patch': 'me'}), name='user-profile'),
    
    # Admin user management
    path('', include(router.urls)),
]