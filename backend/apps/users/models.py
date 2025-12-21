from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator
from django_jalali.db import models as jmodels

# اعتبارسنجی شماره موبایل
mobile_validator = RegexValidator(
    regex=r"^09\d{9}$",
    message=_("شماره موبایل باید با 09 شروع شود و 11 رقم باشد.")
)

class UserManager(BaseUserManager):
    """مدیریت ساخت کاربر بر اساس موبایل"""
    
    def create_user(self, mobile, password=None, **extra_fields):
        """Create and return a regular user with mobile number."""
        if not mobile:
            raise ValueError('شماره موبایل الزامی است')
        user = self.model(mobile=mobile, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, mobile, password=None, **extra_fields):
        """Create and return a superuser with admin privileges."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')
        return self.create_user(mobile, password, **extra_fields)

class User(AbstractUser):
    """Custom user model using mobile number as username."""
    
    class Roles(models.TextChoices):
        """User role choices."""
        ADMIN = 'ADMIN', 'مدیر کل'
        CUSTOMER = 'CUSTOMER', 'مشتری'

    username = None
    mobile = models.CharField('شماره موبایل', max_length=11, unique=True, validators=[mobile_validator])
    email = models.EmailField('ایمیل', blank=True, null=True, unique=True)
    full_name = models.CharField('نام کامل', max_length=100, blank=True)
    national_code = models.CharField('کد ملی', max_length=10, blank=True, null=True)
    
    birth_date = jmodels.jDateField('تاریخ تولد', blank=True, null=True)
    bio = models.TextField('بیوگرافی', blank=True, null=True)
    avatar = models.ImageField('تصویر پروفایل', upload_to='avatars/', blank=True, null=True)
    wallet_balance = models.DecimalField('موجودی کیف پول', max_digits=12, decimal_places=0, default=0)

    role = models.CharField('نقش', max_length=20, choices=Roles.choices, default=Roles.CUSTOMER)
    
    USERNAME_FIELD = 'mobile'
    REQUIRED_FIELDS = []

    objects = UserManager()
    j_objects = jmodels.jManager()

    def __str__(self):
        return self.mobile


class WalletTopUpRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'در انتظار بررسی'
        APPROVED = 'APPROVED', 'تایید شده'
        REJECTED = 'REJECTED', 'رد شده'
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wallet_requests', verbose_name='کاربر')
    amount = models.PositiveIntegerField('مبلغ (تومان)')
    receipt_image = models.ImageField('تصویر رسید', upload_to='wallet_receipts/')
    status = models.CharField('وضعیت', max_length=20, choices=Status.choices, default=Status.PENDING)
    admin_note = models.TextField('توضیحات ادمین', blank=True, null=True)
    created_at = models.DateTimeField('تاریخ ثبت', auto_now_add=True)
    updated_at = models.DateTimeField('تاریخ بروزرسانی', auto_now=True)
    
    class Meta:
        verbose_name = 'درخواست شارژ کیف پول'
        verbose_name_plural = 'درخواست‌های شارژ کیف پول'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.mobile} - {self.amount} تومان - {self.get_status_display()}"

class Ticket(models.Model):
    """Support ticket for communication between users and admins."""
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'باز'
        CLOSED = 'CLOSED', 'بسته شده'
        PENDING = 'PENDING', 'در انتظار پاسخ'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets', verbose_name=_('کاربر'))
    subject = models.CharField(_('موضوع'), max_length=200)
    status = models.CharField(_('وضعیت'), max_length=20, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاریخ بروزرسانی'), auto_now=True)

    class Meta:
        verbose_name = _('تیکت')
        verbose_name_plural = _('تیکت‌ها')
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.subject} - {self.user.mobile}"

class TicketMessage(models.Model):
    """Messages within a support ticket."""
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='messages', verbose_name=_('تیکت'))
    sender = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_('فرستنده'))
    message = models.TextField(_('متن پیام'))
    attachment = models.FileField(_('پیوست'), upload_to='tickets/attachments/', blank=True, null=True)
    created_at = models.DateTimeField(_('تاریخ ارسال'), auto_now_add=True)

    class Meta:
        verbose_name = _('پیام تیکت')
        verbose_name_plural = _('پیام‌های تیکت')
        ordering = ['created_at']

    def __str__(self):
        return f"Message from {self.sender} on {self.ticket.subject}"

class Visitor(models.Model):
    ip_address = models.GenericIPAddressField(verbose_name='آدرس IP')
    date = models.DateField(auto_now_add=True, verbose_name='تاریخ')

    class Meta:
        verbose_name = 'بازدیدکننده'
        verbose_name_plural = 'بازدیدکنندگان'
        unique_together = ('ip_address', 'date')

class SiteStats(models.Model):
    """General site statistics."""
    total_visits = models.PositiveBigIntegerField(default=0, verbose_name='کل بازدیدها')
    today_visits = models.PositiveIntegerField(default=0, verbose_name='بازدیدهای امروز')
    last_visit_date = models.DateField(auto_now=True, verbose_name='تاریخ آخرین بازدید')
    
    class Meta:
        verbose_name = 'آمار سایت'
        verbose_name_plural = 'آمار سایت'

    @classmethod
    def increment_visit(cls, ip_address=None):
        from django.utils import timezone
        stats, created = cls.objects.get_or_create(id=1)
        today = timezone.now().date()
        
        # If IP is provided, check if this IP already visited today
        if ip_address:
            visitor, created = Visitor.objects.get_or_create(ip_address=ip_address, date=today)
            if not created:
                # Already visited today
                return stats
        
        if stats.last_visit_date != today:
            stats.today_visits = 1
        else:
            stats.today_visits += 1
            
        stats.total_visits += 1
        stats.save()
        return stats

class SatisfactionSurvey(models.Model):
    """Survey for customer satisfaction."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='satisfaction_votes')
    is_satisfied = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'نظرسنجی رضایت'
        verbose_name_plural = 'نظرسنجی‌های رضایت'
        unique_together = ('user',)
