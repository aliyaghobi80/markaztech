# مسیر: backend/apps/products/admin.py
from django.contrib import admin
from .models import Category, Product, ProductDownload

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'slug', 'is_active')
    search_fields = ('name',)
    list_filter = ('is_active',)
    # پر شدن خودکار اسلاگ از روی نام
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'product_type', 'price', 'is_active', 'created_at')
    list_filter = ('is_active', 'category', 'product_type')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ('price', 'is_active') # ویرایش سریع قیمت در لیست
    
    fieldsets = (
        ('اطلاعات اصلی', {
            'fields': ('title', 'slug', 'category', 'description')
        }),
        ('نوع محصول', {
            'fields': ('product_type', 'download_file')
        }),
        ('قیمت‌گذاری', {
            'fields': ('price', 'discount_price')
        }),
        ('تصاویر و موجودی', {
            'fields': ('main_image', 'stock', 'delivery_time')
        }),
        ('تنظیمات', {
            'fields': ('is_active', 'show_in_hero')
        }),
    )

@admin.register(ProductDownload)
class ProductDownloadAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'download_count', 'first_download_at', 'last_download_at')
    list_filter = ('first_download_at', 'product__product_type')
    search_fields = ('user__full_name', 'user__mobile', 'product__title')
    readonly_fields = ('download_count', 'first_download_at', 'last_download_at', 'created_at')