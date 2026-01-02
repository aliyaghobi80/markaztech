from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'(?:api/)?ws/products/$', consumers.ProductConsumer.as_asgi()),
    re_path(r'(?:api/)?ws/search/$', consumers.SearchConsumer.as_asgi()),
    re_path(r'(?:api/)?ws/products/(?P<product_id>\d+)/comments/$', consumers.ProductCommentsConsumer.as_asgi()),
]
