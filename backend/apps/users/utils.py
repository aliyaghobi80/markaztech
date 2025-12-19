from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import jdatetime
import datetime

def jalali_relative_time(dt):
    """Returns a human-readable relative time in Jalali (e.g., 5 دقیقه پیش)."""
    if not dt:
        return ""
    
    now = jdatetime.datetime.now(dt.tzinfo)
    diff = now - jdatetime.datetime.fromgregorian(datetime=dt)
    
    seconds = diff.total_seconds()
    if seconds < 60:
        return "لحظاتی پیش"
    elif seconds < 3600:
        return f"{int(seconds // 60)} دقیقه پیش"
    elif seconds < 86400:
        return f"{int(seconds // 3600)} ساعت پیش"
    elif seconds < 2592000:
        return f"{int(seconds // 86400)} روز پیش"
    else:
        return jdatetime.datetime.fromgregorian(datetime=dt).strftime('%Y/%m/%d')

def jalali_full_date(dt):
    """Returns a full Jalali date and time."""
    if not dt:
        return ""
    return jdatetime.datetime.fromgregorian(datetime=dt).strftime('%Y/%m/%d ساعت %H:%M')

def send_comment_update(comment):
    """Sends a comment update to the product group."""
    from apps.products.serializers import CommentSerializer
    
    channel_layer = get_channel_layer()
    group_name = f"product_{comment.product.id}_comments"
    
    serializer = CommentSerializer(comment)
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "comment_update",
            "comment": serializer.data,
            "status": "approved" if comment.is_approved else "pending"
        }
    )

def send_product_update(product, action="update"):
    """Sends a product update to the products group."""
    from apps.products.serializers import ProductSerializer
    
    channel_layer = get_channel_layer()
    serializer = ProductSerializer(product)
    async_to_sync(channel_layer.group_send)(
        "products",
        {
            "type": "product_update",
            "action": action,
            "product": serializer.data
        }
    )

def send_site_stats(stats):
    """Sends site statistics to the site_stats group."""
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "site_stats",
        {
            "type": "stats_update",
            "stats": stats
        }
    )

def send_wallet_update(user):
    """Sends a wallet balance update to the user's group."""
    channel_layer = get_channel_layer()
    group_name = f"user_{user.id}_wallet"
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "wallet_update",
            "balance": float(user.wallet_balance)
        }
    )

def send_wallet_request_update(user, request_id, status, admin_note=None):
    """Sends a wallet request status update message."""
    channel_layer = get_channel_layer()
    group_name = f"user_{user.id}_wallet"
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "wallet_request_update",
            "request_id": request_id,
            "status": status,
            "admin_note": admin_note
        }
    )

def send_ticket_update(ticket):
    """Sends a ticket update to the user and admins."""
    channel_layer = get_channel_layer()
    # Send to user
    user_group = f"user_{ticket.user.id}_tickets"
    async_to_sync(channel_layer.group_send)(
        user_group,
        {
            "type": "ticket_update",
            "ticket_id": ticket.id,
            "status": ticket.status
        }
    )
    # Send to admins group
    async_to_sync(channel_layer.group_send)(
        "admin_notifications",
        {
            "type": "ticket_update",
            "ticket_id": ticket.id,
            "user_mobile": ticket.user.mobile,
            "status": ticket.status
        }
    )
