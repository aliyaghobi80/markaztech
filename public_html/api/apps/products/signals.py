from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.conf import settings

try:
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync
except Exception:
    get_channel_layer = None
    async_to_sync = None

from .models import Product


def _channel_layer():
    if not settings.WEBSOCKETS_ENABLED or not get_channel_layer or not async_to_sync:
        return None
    return get_channel_layer()


def get_product_data(product):
    from django.conf import settings
    
    # O3OOrO¦ URL UcOU.U, O"OñOUO O¦OæU^UOOñ
    main_image_url = None
    if product.main_image:
        if product.main_image.url.startswith('http'):
            main_image_url = product.main_image.url
        else:
            # OOOU?UØ UcOñO_U+ domain O"OñOUO URL UcOU.U,
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
    layer = _channel_layer()
    if not layer:
        return
    
    # OU_Oñ U.O-OæU^U, O§UOOñU?O1OU, O'O_OO O"UØ UØU.UØ OOúU,OO1 O"O_UØ UcUØ O-OøU?O' UcU+U+O_ (O"OñOUO UcOOñO"OñOU+ O1OO_UO)
    if not instance.is_active:
        async_to_sync(layer.group_send)(
            'products',
            {
                'type': 'product_delete',
                'product_id': instance.id
            }
        )
        return

    action = 'created' if created else 'updated'
    
    async_to_sync(layer.group_send)(
        'products',
        {
            'type': 'product_update',
            'action': action,
            'product': get_product_data(instance)
        }
    )


@receiver(post_delete, sender=Product)
def product_deleted(sender, instance, **kwargs):
    layer = _channel_layer()
    if not layer:
        return
    
    async_to_sync(layer.group_send)(
        'products',
        {
            'type': 'product_delete',
            'product_id': instance.id
        }
    )
