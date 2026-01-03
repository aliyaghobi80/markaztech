from django.conf import settings
import jdatetime
import datetime

try:
    from asgiref.sync import async_to_sync
    from channels.layers import get_channel_layer
except Exception:
    async_to_sync = None
    get_channel_layer = None


def _channel_layer():
    """Return channel layer when WebSockets are enabled, otherwise None."""
    if not settings.WEBSOCKETS_ENABLED or not async_to_sync or not get_channel_layer:
        return None
    return get_channel_layer()


def jalali_relative_time(dt):
    """Returns a human-readable relative time in Jalali (e.g., 5 O_U,UOU,UŘ U_UOO')."""
    if not dt:
        return ""
    
    now = jdatetime.datetime.now(dt.tzinfo)
    diff = now - jdatetime.datetime.fromgregorian(datetime=dt)
    
    seconds = diff.total_seconds()
    if seconds < 60:
        return "U,O-O,OOŚUO U_UOO'"
    elif seconds < 3600:
        return f"{int(seconds // 60)} O_U,UOU,UŘ U_UOO'"
    elif seconds < 86400:
        return f"{int(seconds // 3600)} O3OO1OŚ U_UOO'"
    elif seconds < 2592000:
        return f"{int(seconds // 86400)} OńU^Oý U_UOO'"
    else:
        return jdatetime.datetime.fromgregorian(datetime=dt).strftime('%Y/%m/%d')


def jalali_full_date(dt):
    """Returns a full Jalali date and time."""
    if not dt:
        return ""
    return jdatetime.datetime.fromgregorian(datetime=dt).strftime('%Y/%m/%d O3OO1OŚ %H:%M')


def broadcast_site_stats():
    """Broadcasts current site statistics via WebSocket (no-op on shared host)."""
    layer = _channel_layer()
    if not layer:
        return

    from .models import SiteStats, SatisfactionVote
    stats, created = SiteStats.objects.get_or_create(id=1)
    
    total_votes = SatisfactionVote.objects.count()
    satisfied_votes = SatisfactionVote.objects.filter(vote='satisfied').count()
    rate = (satisfied_votes / total_votes * 100) if total_votes > 0 else 100
    
    from .consumers import online_user_connections
    
    stats_data = {
        "total_visits": stats.total_visits,
        "total_satisfied": satisfied_votes,
        "total_satisfied_customers": satisfied_votes,  # Added for HeroSection consistency
        "satisfaction_rate": round(rate, 1),
        "online_users": len(online_user_connections)
    }
    
    async_to_sync(layer.group_send)(
        "site_stats",
        {
            "type": "stats_update",
            "stats": stats_data
        }
    )


def send_comment_update(comment):
    """Sends a comment update to the relevant group (no-op when WS disabled)."""
    layer = _channel_layer()
    if not layer:
        return

    from apps.products.serializers import CommentSerializer as ProductCommentSerializer
    from apps.articles.serializers import ArticleCommentSerializer
    from apps.products.models import Comment as ProductComment
    from apps.articles.models import ArticleComment
    
    if isinstance(comment, ProductComment):
        group_name = f"product_{comment.product.id}_comments"
        serializer = ProductCommentSerializer(comment)
    elif isinstance(comment, ArticleComment):
        group_name = f"article_{comment.article.id}_comments"
        serializer = ArticleCommentSerializer(comment)
    else:
        return

    async_to_sync(layer.group_send)(
        group_name,
        {
            "type": "comment_update",
            "comment": serializer.data,
            "status": "approved" if comment.is_approved else "pending"
        }
    )
    
    # Also send to admin comments group
    async_to_sync(layer.group_send)(
        "admin_comments",
        {
            "type": "comment_update",
            "comment": serializer.data,
            "status": "update"
        }
    )


def send_product_update(product, action="update"):
    """Sends a product update to the products group (no-op on shared host)."""
    layer = _channel_layer()
    if not layer:
        return

    from apps.products.serializers import ProductSerializer
    
    serializer = ProductSerializer(product)
    async_to_sync(layer.group_send)(
        "products",
        {
            "type": "product_update",
            "action": action,
            "product": serializer.data
        }
    )


def send_wallet_update(user):
    """Sends a wallet balance update to the user's group."""
    layer = _channel_layer()
    if not layer:
        return

    group_name = f"user_{user.id}_wallet"
    async_to_sync(layer.group_send)(
        group_name,
        {
            "type": "wallet_update",
            "balance": float(user.wallet_balance)
        }
    )


def send_wallet_request_update(user, request_id, status, admin_note=None):
    """Sends a wallet request status update message."""
    layer = _channel_layer()
    if not layer:
        return
    
    # Send to user's personal wallet group
    user_group_name = f"user_{user.id}_wallet"
    async_to_sync(layer.group_send)(
        user_group_name,
        {
            "type": "wallet_request_update",
            "request_id": request_id,
            "status": status,
            "admin_note": admin_note
        }
    )
    
    # Also send to admin notifications group for real-time admin panel updates
    async_to_sync(layer.group_send)(
        "admin_notifications",
        {
            "type": "wallet_request_update",
            "request_id": request_id,
            "status": status,
            "admin_note": admin_note,
            "user_id": user.id
        }
    )


def send_ticket_update(ticket):
    """Sends a ticket update to the user and admins."""
    layer = _channel_layer()
    if not layer:
        return

    # Send to user
    user_group = f"user_{ticket.user.id}_tickets"
    async_to_sync(layer.group_send)(
        user_group,
        {
            "type": "ticket_update",
            "ticket_id": ticket.id,
            "status": ticket.status
        }
    )
    # Send to admins group
    async_to_sync(layer.group_send)(
        "admin_notifications",
        {
            "type": "ticket_update",
            "ticket_id": ticket.id,
            "user_mobile": ticket.user.mobile,
            "status": ticket.status
        }
    )


def broadcast_site_settings_update(settings_data):
    """Broadcasts site settings update to all connected clients."""
    layer = _channel_layer()
    if not layer:
        return

    async_to_sync(layer.group_send)(
        "site_stats",  # Using existing group for site-wide updates
        {
            "type": "site_settings_update",
            "settings": settings_data
        }
    )
