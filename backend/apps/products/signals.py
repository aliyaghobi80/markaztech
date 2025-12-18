from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Product

def get_product_data(product):
    return {
        'id': product.id,
        'title': product.title,
        'slug': product.slug,
        'price': product.price,
        'discount_price': product.discount_price,
        'is_active': product.is_active,
        'main_image': product.main_image.url if product.main_image else None,
        'category': product.category.name if product.category else None,
        'category_slug': product.category.slug if product.category else None,
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
