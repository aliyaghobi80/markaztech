from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def send_wallet_update(user):
    """
    Sends a wallet update message to the user's WebSocket group.
    """
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
    """
    Sends a wallet request status update message to the user's WebSocket group.
    """
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
