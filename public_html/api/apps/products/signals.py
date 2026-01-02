from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Product

def get_product_data(product):
    from django.conf import settings
    
    # ساخت URL کامل برای تصویر
    main_image_url = None
    if product.main_image:
        if product.main_image.url.startswith('http'):
            main_image_url = product.main_image.url
        else:
            # اضافه کردن domain برای URL کامل
            domain = getattr(settings, 'SITE_DOMAIN', 'http://localhost:8000')
            main_image_url = f"{domain}{product.main_image.url}"
    
    return {
        'id': product.id,
        'title': product.title,
        'slug': product.slug,
        'price': product.price,
        'discount_price': product.discount_price,
        'is_active': product.is_active,
        'main_image': main_image_url,
        'category': {
            'id': product.category.id if product.category else None,
            'name': product.category.name if product.category else None,
            'slug': product.category.slug if product.category else None,
        },
        'delivery_time': product.delivery_time,
        'description': product.description,
        'created_at': product.created_at.isoformat() if product.created_at else None,
    }

@receiver(post_save, sender=Product)
def product_saved(sender, instance, created, **kwargs):
    channel_layer = get_channel_layer()
    
    # اگر محصول غیرفعال شد، به همه اطلاع بده که حذفش کنند (برای کاربران عادی)
    if not instance.is_active:
        async_to_sync(channel_layer.group_send)(
            'products',
            {
                'type': 'product_delete',
                'product_id': instance.id
            }
        )
        return

    action = 'created' if created else 'updated'
    
    async_to_sync(channel_layer.group_send)(
        'products',
        {
            'type': 'product_update',
            'action': action,
            'product': get_product_data(instance)
        }
    )

@receiver(post_delete, sender=Product)
def product_deleted(sender, instance, **kwargs):
    channel_layer = get_channel_layer()
    
    async_to_sync(channel_layer.group_send)(
        'products',
        {
            'type': 'product_delete',
            'product_id': instance.id
        }
    )
