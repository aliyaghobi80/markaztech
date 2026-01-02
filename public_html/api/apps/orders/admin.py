# مسیر: backend/apps/orders/admin.py
from django.contrib import admin
from .models import Order, OrderItem

# تنظیمات نمایش اقلام سفارش به صورت جدول داخل سفارش اصلی
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0  # حذف ردیف‌های خالی اضافه
    readonly_fields = ['product', 'quantity', 'price'] # غیرقابل ویرایش برای امنیت
    can_delete = False

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'total_price', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__mobile', 'id']
    inlines = [OrderItemInline] # چسباندن اقلام به سفارش
    readonly_fields = ['total_price'] # قیمت کل نباید دستی عوض شود

    # مرتب‌سازی پیش‌فرض (جدیدترین‌ها اول)
    ordering = ['-created_at']