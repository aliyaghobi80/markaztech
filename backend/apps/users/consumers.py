import json
from channels.generic.websocket import AsyncWebsocketConsumer

class UserConsumer(AsyncWebsocketConsumer):
    """Consumer for user-specific notifications (wallet, tickets)."""
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_authenticated:
            self.wallet_group = f"user_{self.user.id}_wallet"
            self.ticket_group = f"user_{self.user.id}_tickets"
            
            await self.channel_layer.group_add(self.wallet_group, self.channel_name)
            await self.channel_layer.group_add(self.ticket_group, self.channel_name)
            
            if self.user.is_staff:
                await self.channel_layer.group_add("admin_notifications", self.channel_name)
            
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'wallet_group'):
            await self.channel_layer.group_discard(self.wallet_group, self.channel_name)
        if hasattr(self, 'ticket_group'):
            await self.channel_layer.group_discard(self.ticket_group, self.channel_name)
        if self.user.is_authenticated and self.user.is_staff:
            await self.channel_layer.group_discard("admin_notifications", self.channel_name)

    async def wallet_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "wallet_update",
            "balance": event["balance"]
        }))

    async def wallet_request_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "wallet_request_update",
            "request_id": event["request_id"],
            "status": event["status"],
            "admin_note": event.get("admin_note")
        }))

    async def ticket_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "ticket_update",
            "ticket_id": event["ticket_id"],
            "status": event["status"],
            "user_mobile": event.get("user_mobile")
        }))

class ProductConsumer(AsyncWebsocketConsumer):
    """Consumer for product-specific updates (comments)."""
    async def connect(self):
        self.product_id = self.scope['url_route']['kwargs']['product_id']
        self.group_name = f"product_{self.product_id}_comments"
        
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def comment_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "comment_update",
            "comment_id": event["comment_id"],
            "product_id": event["product_id"],
            "status": event["status"]
        }))
