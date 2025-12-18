# مسیر: backend/apps/users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # تنظیمات نمایش در لیست
    list_display = ('mobile', 'email', 'full_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('mobile', 'full_name', 'email')
    ordering = ('mobile',)

    # فیلدها در صفحه ویرایش کاربر
    fieldsets = (
        (None, {'fields': ('mobile', 'password')}),
        ('اطلاعات شخصی', {'fields': ('full_name', 'email', 'national_code', 'avatar', 'birth_date')}),
        ('وضعیت مالی', {'fields': ('wallet_balance',)}),
        ('دسترسی‌ها', {'fields': ('is_active', 'is_staff', 'is_superuser', 'role', 'groups', 'user_permissions')}),
        ('تاریخ‌ها', {'fields': ('last_login', 'date_joined')}),
    )

    # فیلدها در صفحه افزودن کاربر جدید
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('mobile', 'email', 'password'),
        }),
    )