"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# مسیر: backend/config/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.articles.upload_views import upload_file
from .views import api_root, health_check, channel_layer_health, one_time_setup

urlpatterns = [
    # Root API endpoint
    path('', api_root, name='api-root'),
    path('health/', health_check, name='health-check'),
    path('health/channels/', channel_layer_health, name='channel-health'),
    path('internal/setup/', one_time_setup, name='one-time-setup'),
    
    # Admin
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/products/', include('apps.products.urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/articles/', include('apps.articles.urls')),
    path('api/chat/', include('apps.chat.urls')),
    path('api/upload/', upload_file, name='upload-file'),
    
    # TinyMCE URLs
    path('tinymce/', include('tinymce.urls')),
]

# تنظیمات برای نمایش فایل‌های استاتیک و مدیا
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
