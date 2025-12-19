import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import SiteStats

# Global variable to track online users (simple approach)
# In production, use Redis for this
online_users = set()

class UserConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        self.room_group_name = 'site_stats'
        
        # Add to group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Track online status
        if self.user and self.user.is_authenticated:
            online_users.add(self.user.id)
        else:
            # For anonymous users, track by channel name or just increment a counter
            online_users.add(self.channel_name)
            
        await self.broadcast_stats()

    async def disconnect(self, close_code):
        # Remove from group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
        # Track offline status
        if self.user and self.user.is_authenticated:
            if self.user.id in online_users:
                online_users.remove(self.user.id)
        else:
            if self.channel_name in online_users:
                online_users.remove(self.channel_name)
                
        await self.broadcast_stats()

    async def receive(self, text_data):
        pass

    async def broadcast_stats(self):
        # Fetch stats from DB
        stats_data = await self.get_stats()
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "stats_update",
                "stats": {
                    **stats_data,
                    "online_users": len(online_users)
                }
            }
        )

    async def stats_update(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def get_stats(self):
        from .models import SiteStats, SatisfactionSurvey
        stats, created = SiteStats.objects.get_or_create(id=1)
        
        total_votes = SatisfactionSurvey.objects.count()
        satisfied_votes = SatisfactionSurvey.objects.filter(is_satisfied=True).count()
        rate = (satisfied_votes / total_votes * 100) if total_votes > 0 else 100
        
        return {
            "total_visits": stats.total_visits,
            "total_satisfied": satisfied_votes,
            "total_satisfied_customers": satisfied_votes,
            "satisfaction_rate": round(rate, 1)
        }
