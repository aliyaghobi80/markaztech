import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ProductConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'products'
        
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

    async def product_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'product_update',
            'action': event['action'],
            'product': event['product']
        }))

    async def product_delete(self, event):
        await self.send(text_data=json.dumps({
            'type': 'product_delete',
            'product_id': event['product_id']
        }))
