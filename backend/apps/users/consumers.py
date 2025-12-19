import json
from channels.generic.websocket import AsyncWebsocketConsumer

class WalletConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_authenticated:
            self.group_name = f"user_{self.user.id}_wallet"
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def wallet_update(self, event):
        balance = event["balance"]
        await self.send(text_data=json.dumps({
            "type": "wallet_update",
            "balance": str(balance)
        }))

    async def wallet_request_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "wallet_request_update",
            "request_id": event["request_id"],
            "status": event["status"],
            "admin_note": event.get("admin_note")
        }))
