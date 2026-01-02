# مسیر: backend/apps/users/models.py
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.core.validators import RegexValidator
from django.utils import timezone
from datetime import timedelta


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, mobile, password, **extra_fields):
        if not mobile:
            raise ValueError("Mobile number must be set")
        mobile = str(mobile)
        username_value = extra_fields.pop('username', mobile)
        user = self.model(mobile=mobile, username=username_value, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, mobile=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(mobile, password, **extra_fields)

    def create_superuser(self, mobile=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(mobile, password, **extra_fields)

class User(AbstractUser):
    # فیلدهای اضافی
    mobile = models.CharField(
        max_length=11,
        unique=True,
        null=True,
        blank=True,
        validators=[RegexValidator(regex=r'^09\d{9}$', message='شماره موبایل باید با 09 شروع شود و 11 رقم باشد')]
    )
    full_name = models.CharField(max_length=100, blank=True)
    national_code = models.CharField(max_length=10, blank=True, null=True)
    birth_date = models.DateField(null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    wallet_balance = models.DecimalField(max_digits=10, decimal_places=0, default=0)
    bio = models.TextField(blank=True)
    
    # Override username to make it nullable
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    
    # نقش کاربر
    ROLE_CHOICES = [
        ('CUSTOMER', 'مشتری'),
        ('ADMIN', 'مدیر'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='CUSTOMER')
    
    # وضعیت آنلاین
    is_online = models.BooleanField(default=False, verbose_name='آنلاین')
    last_seen = models.DateTimeField(default=timezone.now, verbose_name='آخرین بازدید')
    
    # تنظیمات احراز هویت - موقتاً کامنت میکنم
    # USERNAME_FIELD = 'mobile'
    USERNAME_FIELD = 'mobile'
    REQUIRED_FIELDS = []

    objects = UserManager()
    
    class Meta:
        verbose_name = 'کاربر'
        verbose_name_plural = 'کاربران'
    
    def __str__(self):
        if self.full_name:
            return self.full_name
        elif self.username:
            return self.username
        elif self.mobile:
            return self.mobile
        else:
            return f"کاربر {self.id}"
    
    @property
    def is_admin(self):
        return self.is_staff or self.is_superuser or self.role == 'ADMIN'

class WalletTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('charge', 'شارژ'),
        ('purchase', 'خرید'),
        ('refund', 'بازگشت وجه'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wallet_transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=0)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']

class WalletChargeRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'در انتظار'),
        ('approved', 'تایید شده'),
        ('rejected', 'رد شده'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='charge_requests')
    amount = models.DecimalField(max_digits=10, decimal_places=0)
    receipt_image = models.ImageField(upload_to='receipts/')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    admin_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']

class SatisfactionVote(models.Model):
    VOTE_CHOICES = [
        ('satisfied', 'راضی'),
        ('dissatisfied', 'ناراضی'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    session_id = models.CharField(max_length=100, null=True, blank=True)
    vote = models.CharField(max_length=12, choices=VOTE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'session_id']

class SiteSettings(models.Model):
    """تنظیمات عمومی سایت"""
    site_name = models.CharField(max_length=100, default='مرکزتک')
    site_logo = models.ImageField(upload_to='site/', null=True, blank=True, help_text='لوگوی اصلی سایت')
    hero_logo = models.ImageField(upload_to='site/', null=True, blank=True, help_text='لوگوی بخش هیرو')
    site_description = models.TextField(blank=True, help_text='توضیحات سایت')
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'تنظیمات سایت'
        verbose_name_plural = 'تنظیمات سایت'
    
    def __str__(self):
        return self.site_name
    
    @classmethod
    def get_settings(cls):
        """دریافت تنظیمات سایت (یا ایجاد در صورت عدم وجود)"""
        settings, created = cls.objects.get_or_create(pk=1)
        return settings

# Compatibility aliases for old model names
WalletTopUpRequest = WalletChargeRequest

class Ticket(models.Model):
    """مدل موقت برای سازگاری"""
    pass

class TicketMessage(models.Model):
    """مدل موقت برای سازگاری"""
    pass

class SiteStats(models.Model):
    """آمار سایت"""
    total_visits = models.IntegerField(default=0)
    today_visits = models.IntegerField(default=0)
    last_visit_date = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'آمار سایت'
        verbose_name_plural = 'آمار سایت'
    
    @classmethod
    def get_stats(cls):
        """دریافت آمار سایت"""
        stats, created = cls.objects.get_or_create(pk=1)
        
        # بررسی تاریخ و ریست کردن آمار روزانه
        today = timezone.now().date()
        if stats.last_visit_date != today:
            stats.today_visits = 0
            stats.last_visit_date = today
            stats.save()
        
        return stats
    
    @classmethod
    def increment_visit(cls, ip_address=None):
        """افزایش تعداد بازدید"""
        stats = cls.get_stats()
        stats.total_visits += 1
        stats.today_visits += 1
        stats.save()
        return stats

class SatisfactionSurvey(models.Model):
    """مدل موقت برای سازگاری"""
    pass
