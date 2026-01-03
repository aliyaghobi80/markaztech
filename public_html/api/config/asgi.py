import os

from django.conf import settings
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

django_asgi_app = get_asgi_application()

# Keep WebSocket routing only when explicitly enabled (e.g., on VPS)
if settings.WEBSOCKETS_ENABLED:
    from channels.routing import ProtocolTypeRouter, URLRouter
    from channels.sessions import SessionMiddlewareStack
    from apps.products.routing import websocket_urlpatterns as products_ws
    from apps.orders.routing import websocket_urlpatterns as orders_ws
    from apps.users.routing import websocket_urlpatterns as users_ws
    from apps.articles.routing import websocket_urlpatterns as articles_ws
    from apps.chat.routing import websocket_urlpatterns as chat_ws
    from apps.users.middleware import TokenAuthMiddleware

    # Aggregate all websocket endpoints
    all_websocket_urlpatterns = products_ws + orders_ws + users_ws + articles_ws + chat_ws

    application = ProtocolTypeRouter({
        'http': django_asgi_app,
        'websocket': SessionMiddlewareStack(
            TokenAuthMiddleware(
                URLRouter(all_websocket_urlpatterns)
            )
        ),
    })
else:
    # Shared hosting path: HTTP only, no Channels layer
    application = django_asgi_app
