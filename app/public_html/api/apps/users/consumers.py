import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import SiteStats
import asyncio
from django.utils import timezone

# Global variable to track online users (connection counts)
# In production, use Redis for this
online_user_connections = {}

# آخرین زمان فعالیت هر کاربر
last_activity = {}

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
        
        # Add to user-specific wallet group if authenticated
        if self.user and self.user.is_authenticated:
            self.user_wallet_group = f"user_{self.user.id}_wallet"
            await self.channel_layer.group_add(self.user_wallet_group, self.channel_name)
        
        # Add to admin groups if staff
        if self.user and self.user.is_authenticated and self.user.is_staff:
            await self.channel_layer.group_add("admin_notifications", self.channel_name)
            await self.channel_layer.group_add("admin_comments", self.channel_name)
        
        await self.accept()
        
        # Simple visit tracking without database
        client_ip = self.scope.get('client', [None])[0]
        
        # Track online status - استفاده از یک شناسه یکتا برای هر کاربر
        online_id = None
        if self.user and self.user.is_authenticated:
            # کاربر لاگین کرده - از user ID استفاده می‌کنیم
            online_id = f"u_{self.user.id}"
        elif self.session and self.session.session_key:
            # کاربر مهمان با session - از session key استفاده می‌کنیم
            online_id = f"s_{self.session.session_key}"
        else:
            # اگر session هم نداریم، از IP استفاده می‌کنیم
            if client_ip:
                online_id = f"ip_{client_ip}"
            else:
                # آخرین راه حل: از channel name استفاده می‌کنیم
                online_id = f"c_{self.channel_name}"
            
        self.online_id = online_id
        
        # فقط اگر این ID قبلاً وجود نداشت، اضافه می‌کنیم
        # این باعث میشه چند تب از یک کاربر فقط یک نفر حساب بشه
        if online_id not in online_user_connections:
            online_user_connections[online_id] = 1
            last_activity[online_id] = timezone.now()
            # فقط وقتی کاربر جدیدی اضافه شد، آمار رو broadcast کن
            await self.simple_broadcast_stats()
        else:
            # اگر قبلاً وجود داشت، فقط تعداد connection ها رو افزایش بده
            online_user_connections[online_id] += 1
            last_activity[online_id] = timezone.now()

    async def disconnect(self, close_code):
        # Remove from groups
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        
        # Remove from user wallet group if authenticated
        if self.user and self.user.is_authenticated:
            await self.channel_layer.group_discard(f"user_{self.user.id}_wallet", self.channel_name)
            
        if self.user and self.user.is_authenticated and self.user.is_staff:
            await self.channel_layer.group_discard("admin_notifications", self.channel_name)
            await self.channel_layer.group_discard("admin_comments", self.channel_name)
            
        # کم کردن تعداد connection ها برای این کاربر
        if hasattr(self, 'online_id') and self.online_id in online_user_connections:
            online_user_connections[self.online_id] -= 1
            
            # اگر تمام connection های این کاربر بسته شد، اون رو از لیست حذف کن
            if online_user_connections[self.online_id] <= 0:
                del online_user_connections[self.online_id]
                if self.online_id in last_activity:
                    del last_activity[self.online_id]
                # فقط وقتی کاربری کاملاً disconnect شد، آمار رو broadcast کن
                await self.simple_broadcast_stats()

    async def receive(self, text_data):
        """دریافت پیام از کلاینت و بروزرسانی آخرین فعالیت"""
        # بروزرسانی آخرین فعالیت کاربر
        if hasattr(self, 'online_id') and self.online_id in last_activity:
            last_activity[self.online_id] = timezone.now()
        
        # پردازش پیام (اگر نیاز باشد)
        try:
            data = json.loads(text_data)
            # می‌توانید اینجا پیام‌های مختلف را پردازش کنید
        except json.JSONDecodeError:
            pass

    async def simple_broadcast_stats(self):
        """Simple stats broadcast without database queries"""
        # پاک کردن connection های قدیمی (بیشتر از 5 دقیقه غیرفعال)
        await self.cleanup_old_connections()
        
        # Get actual stats from database
        stats_data = await self.get_stats()
        stats_data['online_users'] = len(online_user_connections)
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "stats_update",
                "stats": stats_data
            }
        )

    async def cleanup_old_connections(self):
        """پاک کردن connection های قدیمی که بیشتر از 5 دقیقه غیرفعال هستند"""
        now = timezone.now()
        timeout_minutes = 5
        
        expired_connections = []
        for online_id, last_time in last_activity.items():
            if (now - last_time).total_seconds() > (timeout_minutes * 60):
                expired_connections.append(online_id)
        
        for online_id in expired_connections:
            if online_id in online_user_connections:
                del online_user_connections[online_id]
            if online_id in last_activity:
                del last_activity[online_id]

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

    async def wallet_request_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "wallet_request_update",
            "request_id": event.get("request_id"),
            "status": event.get("status"),
            "admin_note": event.get("admin_note")
        }))

    async def site_settings_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "site_settings_update",
            "settings": event["settings"]
        }))

    @database_sync_to_async
    def increment_visit_count(self):
        client_ip = self.scope.get('client', [None])[0]
        SiteStats.increment_visit(ip_address=client_ip)

    @database_sync_to_async
    def get_stats(self):
        from .models import SiteStats, SatisfactionVote
        stats, created = SiteStats.objects.get_or_create(id=1)
        
        total_votes = SatisfactionVote.objects.count()
        satisfied_votes = SatisfactionVote.objects.filter(vote='satisfied').count()
        rate = (satisfied_votes / total_votes * 100) if total_votes > 0 else 100
        
        return {
            "total_visits": stats.total_visits,
            "today_visits": stats.today_visits,
            "total_satisfied": satisfied_votes,
            "total_satisfied_customers": satisfied_votes,
            "satisfaction_rate": round(rate, 1)
        }
