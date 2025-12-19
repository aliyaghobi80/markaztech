from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class Article(models.Model):
    title = models.CharField(_('عنوان'), max_length=255)
    slug = models.SlugField(_('اسلاگ'), unique=True, allow_unicode=True)
    category = models.ForeignKey('products.Category', on_delete=models.SET_NULL, null=True, blank=True, related_name='articles', verbose_name=_('دسته‌بندی'))
    content = models.TextField(_('محتوا'))
    image = models.ImageField(_('تصویر'), upload_to='articles/')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='articles', verbose_name=_('نویسنده'))
    is_active = models.BooleanField(_('فعال'), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('مقاله')
        verbose_name_plural = _('مقالات')
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class ArticleComment(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='comments', verbose_name=_('مقاله'))
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='article_comments', verbose_name=_('کاربر'))
    content = models.TextField(_('متن نظر'))
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies', verbose_name=_('پاسخ به'))
    is_approved = models.BooleanField(_('تایید شده'), default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('نظر مقاله')
        verbose_name_plural = _('نظرات مقالات')
        ordering = ['created_at']

    def __str__(self):
        return f"{self.user} - {self.article.title}"
