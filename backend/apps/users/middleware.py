from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from .models import SiteStats
from django.db.models import F

User = get_user_model()

@database_sync_to_async
def get_user(token_key):
    try:
        access_token = AccessToken(token_key)
        user_id = access_token['user_id']
        return User.objects.get(id=user_id)
    except Exception:
        return AnonymousUser()

class TokenAuthMiddleware:
    """
    Custom middleware that takes a token from the query string and authenticates the user.
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope.get('query_string', b'').decode()
        token = None
        for param in query_string.split('&'):
            if param.startswith('token='):
                token = param.split('=')[1]
                break
        
        if token:
            scope['user'] = await get_user(token)
        else:
            scope['user'] = AnonymousUser()
            
        return await self.inner(scope, receive, send)

class SiteStatsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Update visit count only for unique sessions or just every request for simplicity
        if request.method == 'GET' and (request.path == '/' or request.path.startswith('/product/')):
            from .utils import broadcast_site_stats
            SiteStats.objects.get_or_create(id=1)
            SiteStats.objects.filter(id=1).update(total_visits=F('total_visits') + 1)
            broadcast_site_stats()
            
        response = self.get_response(request)
        return response
