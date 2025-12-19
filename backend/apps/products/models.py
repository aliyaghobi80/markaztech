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
    category = models.ForeignKey(Category, related_name='products', on_delete=models.PROTECT, verbose_name=_('دسته بندی'))
    title = models.CharField(_('عنوان محصول'), max_length=200)
    slug = models.SlugField(unique=True, allow_unicode=True)
    description = models.TextField(_('توضیحات'))
    
    price = models.PositiveIntegerField(_('قیمت اصلی (تومان)'))
    discount_price = models.PositiveIntegerField(_('قیمت با تخفیف'), null=True, blank=True)
    
    main_image = models.ImageField(_('تصویر اصلی'), upload_to='products/')
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    delivery_time = models.CharField(_('زمان تحویل'), max_length=50, default='آنی')

    class Meta:
        verbose_name = _('محصول')
        verbose_name_plural = _('محصولات')

    def __str__(self):
        return self.title

class Comment(models.Model):
    """Product reviews and comments."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='comments', verbose_name=_('محصول'))
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments', verbose_name=_('کاربر'))
    content = models.TextField(_('متن نظر'))
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
