from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def send_wallet_update(user):
    """Sends a wallet update message to the user's WebSocket group."""
    channel_layer = get_channel_layer()
    group_name = f"user_{user.id}_wallet"
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "wallet_update",
            "balance": str(user.wallet_balance)
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

def send_comment_update(comment):
    """Sends a comment update to the product group."""
    from apps.products.serializers import CommentSerializer
    
    channel_layer = get_channel_layer()
    group_name = f"product_{comment.product.id}_comments"
    
    # Serialize the comment
    serializer = CommentSerializer(comment)
    comment_data = serializer.data
    
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "comment_update",
            "comment": comment_data,
            "product_id": comment.product.id,
            "status": "APPROVED" if comment.is_approved else "REJECTED"
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
