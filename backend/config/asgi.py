import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

django_asgi_app = get_asgi_application()

from apps.products.routing import websocket_urlpatterns as products_ws
from apps.orders.routing import websocket_urlpatterns as orders_ws

# ترکیب تمام WebSocket URL patterns
all_websocket_urlpatterns = products_ws + orders_ws

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AuthMiddlewareStack(
        URLRouter(all_websocket_urlpatterns)
    ),
})
