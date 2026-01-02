# مسیر: backend/apps/users/site_models.py
from django.db import models

class SiteSettings(models.Model):
    """تنظیمات عمومی سایت"""
    site_name = models.CharField(max_length=100, default='مرکزتک')
    site_logo = models.ImageField(upload_to='site/', null=True, blank=True, help_text='لوگوی اصلی سایت')
    hero_logo = models.ImageField(upload_to='site/', null=True, blank=True, help_text='لوگوی بخش هیرو')
    site_description = models.TextField(blank=True, help_text='توضیحات سایت')
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'تنظیمات سایت'
        verbose_name_plural = 'تنظیمات سایت'
    
    def __str__(self):
        return self.site_name
    
    @classmethod
    def get_settings(cls):
        """دریافت تنظیمات سایت (یا ایجاد در صورت عدم وجود)"""
        settings, created = cls.objects.get_or_create(pk=1)
        return settings