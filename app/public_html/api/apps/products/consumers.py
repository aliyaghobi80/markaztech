import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.db.models import Q
from .models import Product
from .serializers import ProductSerializer

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

class SearchConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        data = json.loads(text_data)
        query = data.get('query', '')
        
        if len(query) < 2:
            await self.send(text_data=json.dumps({
                'type': 'search_results',
                'results': []
            }))
            return

        results = await self.perform_search(query)
        await self.send(text_data=json.dumps({
            'type': 'search_results',
            'results': results,
            'query': query
        }))

    @database_sync_to_async
    def perform_search(self, query):
        products = Product.objects.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query) |
            Q(category__name__icontains=query),
            is_active=True
        ).order_by('-created_at')[:10]
        
        serializer = ProductSerializer(products, many=True)
        return serializer.data

class ProductCommentsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.product_id = self.scope['url_route']['kwargs']['product_id']
        self.room_group_name = f"product_{self.product_id}_comments"
        
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
