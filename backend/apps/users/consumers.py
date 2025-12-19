import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import SiteStats

# Global variable to track online users (connection counts)
# In production, use Redis for this
online_user_connections = {}

class UserConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        self.session = self.scope.get('session')
        self.room_group_name = 'site_stats'
        
        # Add to site_stats group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        # Add to admin groups if staff
        if self.user and self.user.is_authenticated and self.user.is_staff:
            await self.channel_layer.group_add("admin_notifications", self.channel_name)
            await self.channel_layer.group_add("admin_comments", self.channel_name)
        
        await self.accept()
        
        # Increment visit in DB if not already visited in this session today
        if self.session:
            from django.utils import timezone
            today_str = timezone.now().date().isoformat()
            last_visit = self.session.get('last_visit_date')
            
            if last_visit != today_str:
                await self.increment_visit_count()
                self.session['last_visit_date'] = today_str
                await database_sync_to_async(self.session.save)()
        
        # Track online status
        online_id = None
        if self.user and self.user.is_authenticated:
            online_id = f"u_{self.user.id}"
        elif self.session and self.session.session_key:
            online_id = f"s_{self.session.session_key}"
        else:
            online_id = f"c_{self.channel_name}"
            
        self.online_id = online_id
        
        # Update connection count for this ID
        if online_id not in online_user_connections:
            online_user_connections[online_id] = 0
        online_user_connections[online_id] += 1
            
        await self.broadcast_stats()

    async def disconnect(self, close_code):
        # Remove from groups
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        if self.user and self.user.is_authenticated and self.user.is_staff:
            await self.channel_layer.group_discard("admin_notifications", self.channel_name)
            await self.channel_layer.group_discard("admin_comments", self.channel_name)
            
        if hasattr(self, 'online_id') and self.online_id in online_user_connections:
            online_user_connections[self.online_id] -= 1
            if online_user_connections[self.online_id] <= 0:
                del online_user_connections[self.online_id]
            await self.broadcast_stats()

    async def broadcast_stats(self):
        stats = await self.get_stats()
        stats['online_users'] = len(online_user_connections)
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "stats_update",
                "stats": stats
            }
        )

    async def stats_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "stats_update",
            "stats": event["stats"]
        }))

    async def comment_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "comment_update",
            "comment": event["comment"],
            "status": event.get("status", "update")
        }))

    async def ticket_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "ticket_update",
            "ticket_id": event.get("ticket_id"),
            "status": event.get("status")
        }))

    @database_sync_to_async
    def increment_visit_count(self):
        client_ip = self.scope.get('client', [None])[0]
        SiteStats.increment_visit(ip_address=client_ip)

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
