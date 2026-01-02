# مسیر: backend/apps/chat/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone

class ChatRoom(models.Model):
    """Chat room between user and admin(s)"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_rooms', verbose_name='کاربر', null=True, blank=True)
    guest_phone = models.CharField(max_length=15, null=True, blank=True, verbose_name='شماره مهمان')
    is_active = models.BooleanField(default=True, verbose_name='فعال')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='آخرین بروزرسانی')
    
    class Meta:
        verbose_name = 'اتاق چت'
        verbose_name_plural = 'اتاق‌های چت'
        ordering = ['-updated_at']
        constraints = [
            models.CheckConstraint(
                check=models.Q(user__isnull=False, guest_phone__isnull=True) | 
                      models.Q(user__isnull=True, guest_phone__isnull=False),
                name='chat_room_user_or_guest'
            )
        ]
    
    def __str__(self):
        if self.user:
            return f"چت {self.user.full_name or self.user.mobile}"
        elif self.guest_phone:
            return f"چت مهمان {self.guest_phone}"
        return f"چت ناشناس {self.id}"
    
    @property
    def unread_count_for_user(self):
        """تعداد پیام‌های خوانده نشده برای کاربر"""
        try:
            return self.messages.filter(sender_type='admin', is_read=False).count()
        except Exception as e:
            print(f"Error getting unread count for user: {str(e)}")
            return 0
    
    @property
    def unread_count_for_admin(self):
        """تعداد پیام‌های خوانده نشده برای ادمین"""
        try:
            return self.messages.filter(sender_type='user', is_read=False).count()
        except Exception as e:
            print(f"Error getting unread count for admin: {str(e)}")
            return 0
    
    @property
    def last_message(self):
        """آخرین پیام"""
        try:
            return self.messages.last()
        except Exception as e:
            print(f"Error getting last message: {str(e)}")
            return None

class ChatMessage(models.Model):
    """Chat message in a room"""
    SENDER_CHOICES = [
        ('user', 'کاربر'),
        ('admin', 'ادمین'),
    ]
    
    MESSAGE_TYPES = [
        ('text', 'متن'),
        ('image', 'تصویر'),
        ('audio', 'صوت'),
        ('file', 'فایل'),
    ]
    
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages', verbose_name='اتاق چت')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, verbose_name='فرستنده')
    sender_type = models.CharField(max_length=10, choices=SENDER_CHOICES, verbose_name='نوع فرستنده')
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text', verbose_name='نوع پیام')
    message = models.TextField(verbose_name='پیام', blank=True)
    
    # فایل‌های رسانه‌ای
    image = models.ImageField(upload_to='chat/images/', null=True, blank=True, verbose_name='تصویر')
    audio = models.FileField(upload_to='chat/audio/', null=True, blank=True, verbose_name='صوت')
    file = models.FileField(upload_to='chat/files/', null=True, blank=True, verbose_name='فایل')
    
    # متادیتا برای فایل‌ها
    file_name = models.CharField(max_length=255, null=True, blank=True, verbose_name='نام فایل')
    file_size = models.PositiveIntegerField(null=True, blank=True, verbose_name='اندازه فایل')
    
    is_read = models.BooleanField(default=False, verbose_name='خوانده شده')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ارسال')
    
    class Meta:
        verbose_name = 'پیام چت'
        verbose_name_plural = 'پیام‌های چت'
        ordering = ['created_at']
    
    def __str__(self):
        sender_name = "مهمان"
        if self.sender:
            sender_name = self.sender.full_name or self.sender.mobile or "کاربر"
        elif self.sender_type == 'admin':
            sender_name = "ادمین"
        
        if self.message_type == 'text':
            return f"{sender_name}: {self.message[:50]}"
        else:
            return f"{sender_name}: [{self.get_message_type_display()}]"
    
    @property
    def file_url(self):
        """بازگرداندن URL فایل بر اساس نوع پیام"""
        if self.message_type == 'image' and self.image:
            return self.image.url
        elif self.message_type == 'audio' and self.audio:
            return self.audio.url
        elif self.message_type == 'file' and self.file:
            return self.file.url
        return None

class AdminOnlineStatus(models.Model):
    """Track admin online status"""
    admin = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='online_status', verbose_name='ادمین')
    is_online = models.BooleanField(default=False, verbose_name='آنلاین')
    last_seen = models.DateTimeField(default=timezone.now, verbose_name='آخرین بازدید')
    
    class Meta:
        verbose_name = 'وضعیت آنلاین ادمین'
        verbose_name_plural = 'وضعیت آنلاین ادمین‌ها'
    
    def __str__(self):
        return f"{self.admin.full_name or self.admin.mobile} - {'آنلاین' if self.is_online else 'آفلاین'}"