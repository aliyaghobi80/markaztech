# U.O3UOOñ: backend/apps/chat/utils.py
from django.conf import settings

try:
    from asgiref.sync import async_to_sync
    from channels.layers import get_channel_layer
except Exception:
    async_to_sync = None
    get_channel_layer = None


def send_chat_message_update(room, message):
    """Send chat message to WebSocket subscribers (no-op when WS disabled)."""
    if not settings.WEBSOCKETS_ENABLED or not async_to_sync or not get_channel_layer:
        return  # WebSocket disabled on shared hosting

    channel_layer = get_channel_layer()
    if not channel_layer:
        return

    # Room-level notification
    room_group_name = f"chat_room_{room.id}"

    # Determine sender name
    sender_name = "U.UØU.OU+"
    if message.sender:
        sender_name = message.sender.full_name or message.sender.mobile or message.sender.username
    elif message.sender_type == 'admin':
        sender_name = "OO_U.UOU+ U_O'O¦UOO\"OU+UO"
    elif hasattr(room, 'guest_phone') and room.guest_phone:
        sender_name = f"U.UØU.OU+ {room.guest_phone}"

    async_to_sync(channel_layer.group_send)(
        room_group_name,
        {
            "type": "chat_message",
            "message_id": message.id,
            "message": message.message,
            "sender_type": message.sender_type,
            "sender_name": sender_name,
            "created_at": message.created_at.isoformat(),
        }
    )

    # Admin notification
    if message.sender_type == 'user':
        async_to_sync(channel_layer.group_send)(
            "admin_notifications",
            {
                "type": "new_chat_message",
                "room_id": room.id,
                "message": message.message[:50],
                "sender_name": sender_name,
            }
        )
