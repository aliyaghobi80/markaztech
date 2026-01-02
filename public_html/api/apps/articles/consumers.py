import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ArticleCommentsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.article_id = self.scope['url_route']['kwargs']['article_id']
        self.room_group_name = f"article_{self.article_id}_comments"
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        pass

    async def comment_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'comment_update',
            'comment': event['comment'],
            'status': event['status']
        }))
