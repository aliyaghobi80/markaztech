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
from django.http import HttpResponse

def home_view(request):
    return HttpResponse("""
        <html>
            <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                <h1>Backend API is running</h1>
                <p>Redirecting you to the Storefront (Port 3000)...</p>
                <script>
                    if (window.location.hostname.includes("-8000")) {
                        window.location.href = window.location.href.replace("-8000", "-3000");
                    } else if (window.location.port === "8000") {
                        window.location.href = window.location.protocol + "//" + window.location.hostname + ":3000";
                    }
                </script>
                <p>If not redirected, <a href="http://localhost:3000">click here for Port 3000</a>.</p>
            </body>
        </html>
    """)

urlpatterns = [
    path('', home_view),
    path('admin/', admin.site.urls),
    # اضافه کردن مسیر API محصولات
    path('api/products/', include('apps.products.urls')),
    # اضافه کردن مسیر کاربران
    path('api/users/', include('apps.users.urls')),
    path('api/orders/', include('apps.orders.urls')),
]

# تنظیمات برای نمایش فایل‌های استاتیک و مدیا
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
