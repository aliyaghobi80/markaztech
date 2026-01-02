# مسیر: backend/apps/chat/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatRoomViewSet, AdminOnlineStatusViewSet, GuestChatViewSet

router = DefaultRouter()
router.register(r'rooms', ChatRoomViewSet, basename='chat-rooms')
router.register(r'admin-status', AdminOnlineStatusViewSet, basename='admin-status')
router.register(r'guest', GuestChatViewSet, basename='guest-chat')

urlpatterns = [
    path('', include(router.urls)),
]