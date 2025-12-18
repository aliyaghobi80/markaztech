from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator

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
    
    # فیلدهای جدید که باعث ارور ادمین شده بودند
    birth_date = models.DateField('تاریخ تولد', blank=True, null=True)
    avatar = models.ImageField('تصویر پروفایل', upload_to='avatars/', blank=True, null=True)
    wallet_balance = models.DecimalField('موجودی کیف پول', max_digits=12, decimal_places=0, default=0)

    role = models.CharField('نقش', max_length=20, choices=Roles.choices, default=Roles.CUSTOMER)
    
    USERNAME_FIELD = 'mobile'
    REQUIRED_FIELDS = []

    objects = UserManager()

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