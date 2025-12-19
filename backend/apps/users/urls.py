# مسیر: backend/apps/users/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, ProfileViewSet, CustomTokenObtainPairView, UserRegistrationView,
    WalletTopUpRequestViewSet, AdminWalletAdjustmentView, AdminStatisticsView, LogoutView
)
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'list', UserViewSet, basename='user-management')
router.register(r'wallet-requests', WalletTopUpRequestViewSet, basename='wallet-requests')

urlpatterns = [
    # Authentication endpoints
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('logout/', LogoutView.as_view(), name='user-logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile management
    path('profile/', ProfileViewSet.as_view({'get': 'me', 'patch': 'me'}), name='user-profile'),
    
    # Admin endpoints
    path('wallet/adjust/', AdminWalletAdjustmentView.as_view(), name='admin-wallet-adjust'),
    path('admin/statistics/', AdminStatisticsView.as_view(), name='admin-statistics'),
    
    # Admin user management and wallet requests
    path('', include(router.urls)),
]