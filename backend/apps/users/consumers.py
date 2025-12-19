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
        self.session = self.scope.get('session')
        self.room_group_name = 'site_stats'
        
        # Add to group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Increment visit in DB
        await self.increment_visit_count()
        
        # Track online status
        online_id = None
        if self.user and self.user.is_authenticated:
            online_id = f"u_{self.user.id}"
        elif self.session and self.session.session_key:
            online_id = f"s_{self.session.session_key}"
        else:
            online_id = f"c_{self.channel_name}"
            
        self.online_id = online_id
        online_users.add(online_id)
            
        await self.broadcast_stats()

    @database_sync_to_async
    def increment_visit_count(self):
        SiteStats.increment_visit()

    @database_sync_to_async
    def get_stats(self):
        from .models import SiteStats, SatisfactionSurvey
        stats, created = SiteStats.objects.get_or_create(id=1)
        
        total_votes = SatisfactionSurvey.objects.count()
        satisfied_votes = SatisfactionSurvey.objects.filter(is_satisfied=True).count()
        rate = (satisfied_votes / total_votes * 100) if total_votes > 0 else 100
        
        return {
            "total_visits": stats.total_visits,
            "today_visits": stats.today_visits,
            "total_satisfied": satisfied_votes,
            "total_satisfied_customers": satisfied_votes,
            "satisfaction_rate": round(rate, 1)
        }

