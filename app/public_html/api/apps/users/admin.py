# مسیر: backend/apps/users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, SiteSettings, WalletChargeRequest, WalletTransaction, SatisfactionVote
import django_jalali.admin as jadmin

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # تنظیمات نمایش در لیست
    list_display = ('mobile', 'full_name', 'email', 'is_staff', 'wallet_balance', 'role')
    list_filter = ('is_staff', 'is_active', 'role')
    search_fields = ('mobile', 'full_name', 'email')
    ordering = ('mobile',)

    # فیلدها در صفحه ویرایش کاربر
    fieldsets = (
        (None, {'fields': ('mobile', 'password')}),
        ('اطلاعات شخصی', {'fields': ('full_name', 'email', 'national_code', 'birth_date', 'avatar', 'bio')}),
        ('وضعیت مالی', {'fields': ('wallet_balance',)}),
        ('نقش و دسترسی‌ها', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('تاریخ‌ها', {'fields': ('last_login', 'date_joined')}),
    )

    # فیلدها در صفحه افزودن کاربر جدید
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('mobile', 'full_name', 'email', 'password1', 'password2', 'role'),
        }),
    )

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ('site_name', 'contact_email', 'contact_phone', 'updated_at')
    fieldsets = (
        ('اطلاعات اصلی', {'fields': ('site_name', 'site_description')}),
        ('لوگوها', {'fields': ('site_logo', 'hero_logo')}),
        ('اطلاعات تماس', {'fields': ('contact_email', 'contact_phone')}),
    )

@admin.register(WalletChargeRequest)
class WalletChargeRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__mobile', 'user__full_name')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'transaction_type', 'created_at')
    list_filter = ('transaction_type', 'created_at')
    search_fields = ('user__mobile', 'user__full_name')
    readonly_fields = ('created_at',)

@admin.register(SatisfactionVote)
class SatisfactionVoteAdmin(admin.ModelAdmin):
    list_display = ('user', 'vote', 'created_at')
    list_filter = ('vote', 'created_at')
    readonly_fields = ('created_at',)