"""
Main views for MarkazTech API
"""

from django.http import JsonResponse, HttpResponseNotFound
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.core.management import call_command
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json
import os
import logging
from pathlib import Path
from channels.layers import InMemoryChannelLayer

@csrf_exempt
@require_http_methods(["GET"])
def api_root(request):
    """
    API root endpoint
    """
    return JsonResponse({
        'message': 'MarkazTech API is running!',
        'version': '1.0.0',
        'status': 'active',
        'endpoints': {
            'admin': '/admin/',
            'products': '/api/products/',
            'users': '/api/users/',
            'orders': '/api/orders/',
            'articles': '/api/articles/',
            'chat': '/api/chat/',
            'upload': '/api/upload/',
        }
    })

@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """
    Health check endpoint
    """
    return JsonResponse({
        'status': 'healthy',
        'message': 'MarkazTech API is working properly'
    })


@csrf_exempt
@require_http_methods(["GET"])
def one_time_setup(request):
    """
    One-time setup runner (migrate, collectstatic, create admin).
    Protected by SETUP_TOKEN and disabled after first success.
    """
    logger = logging.getLogger(__name__)

    # Only allow in production mode with explicit token configured
    setup_token = os.getenv('SETUP_TOKEN')
    if settings.DEBUG or not setup_token:
        return HttpResponseNotFound()

    # Require correct token
    if request.GET.get('token') != setup_token:
        return HttpResponseNotFound()

    flag_path = Path(settings.BASE_DIR) / 'logs' / 'setup_done.flag'
    flag_path.parent.mkdir(parents=True, exist_ok=True)

    # If already completed, hide endpoint
    if flag_path.exists():
        return HttpResponseNotFound()

    admin_phone = os.getenv('SETUP_ADMIN_PHONE')
    admin_password = os.getenv('SETUP_ADMIN_PASSWORD')
    admin_email = os.getenv('SETUP_ADMIN_EMAIL', '')

    logger.info("One-time setup started at %s", timezone.now())

    try:
        call_command('migrate', interactive=False, verbosity=1)
        call_command('collectstatic', interactive=False, verbosity=0, link=False, clear=False)

        if admin_phone and admin_password:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            if not User.objects.filter(mobile=admin_phone).exists():
                User.objects.create_superuser(
                    mobile=admin_phone,
                    password=admin_password,
                    username=admin_phone,
                    email=admin_email,
                )
                logger.info("Superuser created with mobile %s", admin_phone)
            else:
                logger.info("Superuser already exists; skipped creation")
        else:
            logger.warning("Admin credentials not provided; skipped superuser creation")

        flag_path.write_text("completed")
        logger.info("One-time setup completed and disabled")

        return JsonResponse({'status': 'ok', 'message': 'Setup completed; endpoint disabled'})
    except Exception as exc:
        logger.exception("One-time setup failed: %s", exc)
        return JsonResponse({'status': 'error', 'message': 'Setup failed; see logs'}, status=500)


@require_http_methods(["GET"])
def channel_layer_health(request):
    """
    Lightweight channel layer connectivity probe.
    """
    layer = get_channel_layer()
    if not layer:
        return JsonResponse({'channel_layer': 'not-configured', 'mode': 'polling'}, status=500)
    try:
        channel_name = async_to_sync(layer.new_channel)("health")
        async_to_sync(layer.send)(channel_name, {"type": "health.check", "text": "ok"})
        status = 'degraded' if isinstance(layer, InMemoryChannelLayer) and not settings.DEBUG else 'websocket'
        return JsonResponse({'channel_layer': 'ok', 'mode': status})
    except Exception as exc:
        logging.getLogger(__name__).exception("Channel layer health failed: %s", exc)
        return JsonResponse({'channel_layer': 'error', 'mode': 'polling'}, status=500)


@require_http_methods(["GET"])
def realtime_health(request):
    """
    Reports realtime capability for frontends to decide WS vs polling.
    """
    layer = get_channel_layer()
    if layer and isinstance(layer, InMemoryChannelLayer):
        mode = 'degraded' if not settings.DEBUG else 'websocket'
    elif layer:
        mode = 'websocket'
    else:
        mode = 'polling'
    return JsonResponse({'realtime': mode})
