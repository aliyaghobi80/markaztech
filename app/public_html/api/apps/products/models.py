import os
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings

class Category(models.Model):
    """Product category model with hierarchical structure."""
    name = models.CharField(_('نام دسته'), max_length=100)
    slug = models.SlugField(unique=True, allow_unicode=True, help_text=_('نام در آدرس سایت'))
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True, related_name='children',
        verbose_name=_('دسته مادر')
    )
    icon = models.ImageField(_('آیکون'), upload_to='categories/icons/', blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = _('دسته بندی')
        verbose_name_plural = _('دسته بندی ها')

    def __str__(self):
        full_path = [self.name]
        k = self.parent
        while k is not None:
            full_path.append(k.name)
            k = k.parent
        return ' > '.join(full_path[::-1])

class Product(models.Model):
    """Digital product model for AI services and tools."""
    
    # Product Type Choices
    PRODUCT_TYPES = [
        ('account', 'اکانت'),
        ('file', 'فایل'),
    ]
    
    category = models.ForeignKey(Category, related_name='products', on_delete=models.PROTECT, verbose_name=_('دسته بندی'))
    title = models.CharField(_('عنوان محصول'), max_length=200)
    slug = models.SlugField(unique=True, allow_unicode=True)
    description = models.TextField(_('توضیحات'))
    
    # Product type and file support
    product_type = models.CharField(_('نوع محصول'), max_length=20, choices=PRODUCT_TYPES, default='account')
    download_file = models.FileField(_('فایل دانلود'), upload_to='products/files/', null=True, blank=True, 
                                   help_text=_('فایل قابل دانلود برای مشتریان (فقط برای محصولات فایل)'))
    
    price = models.PositiveIntegerField(_('قیمت اصلی (تومان)'))
    discount_price = models.PositiveIntegerField(_('قیمت با تخفیف'), null=True, blank=True)
    
    main_image = models.ImageField(_('تصویر اصلی'), upload_to='products/')
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    show_in_hero = models.BooleanField(_('نمایش در اسلایدر هیرو'), default=False)
    delivery_time = models.CharField(_('زمان تحویل'), max_length=50, default='آنی')
    stock = models.PositiveIntegerField(_('موجودی'), default=10)

    class Meta:
        verbose_name = _('محصول')
        verbose_name_plural = _('محصولات')

    def __str__(self):
        return self.title
    
    @property
    def file_type(self):
        """Get file type from file extension."""
        if self.download_file:
            _, ext = os.path.splitext(self.download_file.name)
            return ext.lower().lstrip('.')
        return None
    
    @property
    def file_size(self):
        """Get file size in human readable format."""
        if self.download_file:
            try:
                size = self.download_file.size
                for unit in ['B', 'KB', 'MB', 'GB']:
                    if size < 1024.0:
                        return f"{size:.1f} {unit}"
                    size /= 1024.0
                return f"{size:.1f} TB"
            except:
                return "نامشخص"
        return None

class Comment(models.Model):
    """Product reviews and comments."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='comments', verbose_name=_('محصول'))
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments', verbose_name=_('کاربر'))
    content = models.TextField(_('متن نظر'))
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies', verbose_name=_('پاسخ به'))
    rating = models.PositiveSmallIntegerField(_('امتیاز'), default=5)
    is_approved = models.BooleanField(_('تایید شده'), default=False)
    created_at = models.DateTimeField(_('تاریخ ثبت'), auto_now_add=True)

    class Meta:
        verbose_name = _('نظر')
        verbose_name_plural = _('نظرات')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} - {self.product.title}"

class Favorite(models.Model):
    """User wishlist/favorites."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites', verbose_name=_('کاربر'))
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='favorited_by', verbose_name=_('محصول'))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('علاقه‌مندی')
        verbose_name_plural = _('علاقه‌مندی‌ها')
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user} - {self.product.title}"

class ProductDownload(models.Model):
    """Track product file downloads for purchased products."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name=_('کاربر'))
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name=_('محصول'))
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, verbose_name=_('سفارش'), null=True, blank=True)
    download_count = models.PositiveIntegerField(_('تعداد دانلود'), default=0)
    first_download_at = models.DateTimeField(_('اولین دانلود'), null=True, blank=True)
    last_download_at = models.DateTimeField(_('آخرین دانلود'), null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('دانلود محصول')
        verbose_name_plural = _('دانلودهای محصولات')
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user} - {self.product.title} ({self.download_count} دانلود)"
