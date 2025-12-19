from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/articles/(?P<article_id>\d+)/comments/$', consumers.ArticleCommentsConsumer.as_asgi()),
]
