# مسیر: backend/apps/chat/utils.py
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

def send_chat_message_update(room, message):
    """ارسال بروزرسانی پیام چت از طریق WebSocket"""
    channel_layer = get_channel_layer()
    
    # ارسال به گروه اتاق چت
    room_group_name = f"chat_room_{room.id}"
    
    # تعیین نام فرستنده
    sender_name = "مهمان"
    if message.sender:
        sender_name = message.sender.full_name or message.sender.mobile or message.sender.username
    elif message.sender_type == 'admin':
        sender_name = "ادمین پشتیبانی"
    elif hasattr(room, 'guest_phone') and room.guest_phone:
        sender_name = f"مهمان {room.guest_phone}"
    
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
    
    # ارسال به ادمین‌ها برای اطلاع از پیام جدید
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