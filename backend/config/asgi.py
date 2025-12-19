import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.sessions import SessionMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

django_asgi_app = get_asgi_application()

from apps.products.routing import websocket_urlpatterns as products_ws
from apps.orders.routing import websocket_urlpatterns as orders_ws
from apps.users.routing import websocket_urlpatterns as users_ws
from apps.articles.routing import websocket_urlpatterns as articles_ws

# ترکیب تمام WebSocket URL patterns
all_websocket_urlpatterns = products_ws + orders_ws + users_ws + articles_ws

from apps.users.middleware import TokenAuthMiddleware

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': SessionMiddlewareStack(
        TokenAuthMiddleware(
            URLRouter(all_websocket_urlpatterns)
        )
    ),
})
