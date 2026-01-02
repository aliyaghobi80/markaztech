# مسیر: backend/apps/chat/serializers.py
from rest_framework import serializers
from .models import ChatRoom, ChatMessage, AdminOnlineStatus
from apps.users.models import User

class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    sender_avatar = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'message', 'message_type', 'sender_type', 'sender_name', 'sender_avatar', 
            'file_url', 'file_name', 'file_size', 'is_read', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'sender_name', 'sender_avatar', 'file_url']
    
    def get_sender_name(self, obj):
        if obj.sender:
            return obj.sender.full_name or obj.sender.mobile or obj.sender.username
        elif obj.sender_type == 'admin':
            return "ادمین پشتیبانی"
        else:
            # Guest user
            if hasattr(obj.room, 'guest_phone') and obj.room.guest_phone:
                return f"مهمان {obj.room.guest_phone}"
            return "مهمان"
    
    def get_sender_avatar(self, obj):
        if obj.sender and obj.sender.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.sender.avatar.url)
            return obj.sender.avatar.url
        return None
    
    def get_file_url(self, obj):
        if obj.file_url:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file_url)
            return obj.file_url
        return None

class ChatRoomSerializer(serializers.ModelSerializer):
    last_message = ChatMessageSerializer(read_only=True)
    unread_count = serializers.SerializerMethodField()
    participant_name = serializers.SerializerMethodField()
    participant_avatar = serializers.SerializerMethodField()
    participant_online = serializers.SerializerMethodField()
    participant_last_seen = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'participant_name', 'participant_avatar', 'participant_online', 
            'participant_last_seen', 'is_active', 'created_at', 'updated_at', 
            'last_message', 'unread_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_unread_count(self, obj):
        try:
            request = self.context.get('request')
            if request and request.user.is_authenticated:
                if request.user.is_staff:
                    return obj.unread_count_for_admin
                else:
                    return obj.unread_count_for_user
            return 0
        except Exception as e:
            print(f"Error getting unread count: {str(e)}")
            return 0
    
    def get_participant_name(self, obj):
        try:
            request = self.context.get('request')
            if request and request.user.is_authenticated and request.user.is_staff:
                # ادمین می‌بیند نام کاربر یا مهمان
                if obj.user:
                    return obj.user.full_name or obj.user.mobile or obj.user.username
                elif obj.guest_phone:
                    return f"مهمان {obj.guest_phone}"
                return "کاربر ناشناس"
            else:
                # کاربر می‌بیند "پشتیبانی"
                return "پشتیبانی مرکز تک"
        except Exception as e:
            print(f"Error getting participant name: {str(e)}")
            return "نامشخص"
    
    def get_participant_avatar(self, obj):
        try:
            request = self.context.get('request')
            if request and request.user.is_authenticated and request.user.is_staff:
                # ادمین می‌بیند آواتار کاربر
                if obj.user and obj.user.avatar:
                    if request:
                        return request.build_absolute_uri(obj.user.avatar.url)
                    return obj.user.avatar.url
            return None
        except Exception as e:
            print(f"Error getting participant avatar: {str(e)}")
            return None
    
    def get_participant_online(self, obj):
        try:
            request = self.context.get('request')
            if request and request.user.is_authenticated and request.user.is_staff:
                # ادمین می‌بیند وضعیت آنلاین کاربر
                if obj.user:
                    return obj.user.is_online
            else:
                # کاربر می‌بیند وضعیت آنلاین ادمین‌ها
                from .models import AdminOnlineStatus
                return AdminOnlineStatus.objects.filter(is_online=True).exists()
            return False
        except Exception as e:
            print(f"Error getting participant online status: {str(e)}")
            return False
    
    def get_participant_last_seen(self, obj):
        try:
            request = self.context.get('request')
            if request and request.user.is_authenticated and request.user.is_staff:
                # ادمین می‌بیند آخرین بازدید کاربر
                if obj.user:
                    return obj.user.last_seen
            return None
        except Exception as e:
            print(f"Error getting participant last seen: {str(e)}")
            return None

class AdminOnlineStatusSerializer(serializers.ModelSerializer):
    admin_name = serializers.CharField(source='admin.full_name', read_only=True)
    admin_avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = AdminOnlineStatus
        fields = ['admin_name', 'admin_avatar', 'is_online', 'last_seen']
    
    def get_admin_avatar(self, obj):
        if obj.admin.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.admin.avatar.url)
            return obj.admin.avatar.url
        return None

class GuestChatSerializer(serializers.Serializer):
    """Serializer for guest chat initiation"""
    phone = serializers.CharField(max_length=15)
    message = serializers.CharField(max_length=1000)
    
    def validate_phone(self, value):
        # اعتبارسنجی شماره تلفن
        if not value.startswith('09') or len(value) != 11:
            raise serializers.ValidationError("شماره تلفن باید 11 رقم و با 09 شروع شود")
        return value