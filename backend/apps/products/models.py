from django.db import models
from django.utils.translation import gettext_lazy as _

class Category(models.Model):
    """Product category model with hierarchical structure."""
    name = models.CharField(_('نام دسته'), max_length=100)
    slug = models.SlugField(unique=True, allow_unicode=True, help_text=_('نام در آدرس سایت'))
    # این فیلد کلید طلایی برای منوی آبشاری است:
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
        # نمایش به صورت: هوش مصنوعی > چت بات > ChatGPT
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
    
    # قیمت‌ها
    price = models.PositiveIntegerField(_('قیمت اصلی (تومان)'))
    discount_price = models.PositiveIntegerField(_('قیمت با تخفیف'), null=True, blank=True)
    
    # تصویر اصلی
    main_image = models.ImageField(_('تصویر اصلی'), upload_to='products/')
    
    # ویژگی‌های محصول دیجیتال
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # تحویل آنی (بعداً فیلد اکانت را در جدول جدا می‌گذاریم یا همینجا رمزنگاری می‌کنیم)
    delivery_time = models.CharField(_('زمان تحویل'), max_length=50, default='آنی')

    class Meta:
        verbose_name = _('محصول')
        verbose_name_plural = _('محصولات')

    def __str__(self):
        return self.title