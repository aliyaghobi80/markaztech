from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArticleViewSet, ArticleCommentViewSet

router = DefaultRouter()
router.register(r'comments', ArticleCommentViewSet, basename='article-comment')
router.register(r'', ArticleViewSet, basename='article')

urlpatterns = [
    path('', include(router.urls)),
]
