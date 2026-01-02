# مسیر: backend/apps/chat/admin.py
from django.contrib import admin
from .models import ChatRoom, ChatMessage, AdminOnlineStatus

@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'guest_phone', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('user__full_name', 'user__mobile', 'guest_phone')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'room', 'sender_type', 'sender', 'message_preview', 'is_read', 'created_at')
    list_filter = ('sender_type', 'is_read', 'created_at')
    search_fields = ('message', 'sender__full_name', 'sender__mobile')
    readonly_fields = ('created_at',)
    
    def message_preview(self, obj):
        return obj.message[:50] + "..." if len(obj.message) > 50 else obj.message
    message_preview.short_description = 'پیش‌نمایش پیام'

@admin.register(AdminOnlineStatus)
class AdminOnlineStatusAdmin(admin.ModelAdmin):
    list_display = ('admin', 'is_online', 'last_seen')
    list_filter = ('is_online', 'last_seen')
    search_fields = ('admin__full_name', 'admin__mobile')