# مسیر: backend/apps/chat/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatRoom, ChatMessage

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_room_{self.room_id}'
        self.user = self.scope.get('user')
        
        # بررسی وجود اتاق چت
        room_exists = await self.check_room_exists()
        if not room_exists:
            await self.close()
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        print(f"✅ Chat WebSocket connected to room {self.room_id}")
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print(f"🔌 Chat WebSocket disconnected from room {self.room_id}")
    
    @database_sync_to_async
    def check_room_exists(self):
        try:
            ChatRoom.objects.get(id=self.room_id)
            return True
        except ChatRoom.DoesNotExist:
            return False
    
    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json.get('message', '').strip()
            
            if not message:
                return
            
            # Save message to database
            chat_message = await self.save_message(message)
            
            if chat_message:
                # Send message to room group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message_id': chat_message.id,
                        'message': chat_message.message,
                        'sender_type': chat_message.sender_type,
                        'sender_name': await self.get_sender_name(chat_message),
                        'created_at': chat_message.created_at.isoformat(),
                    }
                )
        except json.JSONDecodeError:
            pass
    
    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message_id': event['message_id'],
            'message': event['message'],
            'sender_type': event['sender_type'],
            'sender_name': event['sender_name'],
            'created_at': event['created_at'],
        }))
    
    @database_sync_to_async
    def save_message(self, message):
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            
            # Check if user has permission to send message in this room
            if self.user and self.user.is_authenticated:
                if not self.user.is_staff and room.user != self.user:
                    return None
                
                sender_type = 'admin' if self.user.is_staff else 'user'
                
                chat_message = ChatMessage.objects.create(
                    room=room,
                    sender=self.user,
                    sender_type=sender_type,
                    message=message
                )
                
                # Update room timestamp
                room.save()
                
                return chat_message
        except ChatRoom.DoesNotExist:
            pass
        return None
    
    @database_sync_to_async
    def get_sender_name(self, message):
        if message.sender:
            return message.sender.full_name or message.sender.mobile
        return "مهمان"