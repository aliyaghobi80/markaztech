from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.conf import settings

try:
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync
except Exception:
    get_channel_layer = None
    async_to_sync = None

from .models import Order


def _channel_layer():
    if not settings.WEBSOCKETS_ENABLED or not get_channel_layer or not async_to_sync:
        return None
    return get_channel_layer()


def get_order_data(order):
    # U,OU_ O"OñOUO O1UOO"ƒ?OUOOO"UO
    print(f"DEBUG: get_order_data for order {order.id}")
    print(f"DEBUG: Available attributes: {dir(order)}")
    
    payment_receipt_url = None
    try:
        if hasattr(order, 'payment_receipt') and order.payment_receipt:
            payment_receipt_url = order.payment_receipt.url
    except Exception as e:
        print(f"DEBUG: Error accessing payment_receipt: {e}")

    return {
        'id': order.id,
        'user_id': order.user.id if order.user else None,
        'user_name': order.user.full_name if order.user and order.user.full_name else 'U+OU.O\"rOæ',
        'user_mobile': order.user.mobile if order.user and order.user.mobile else 'U+OU.O\"rOæ',
        'total_price': order.total_price,
        'status': order.status,
        'created_at': order.created_at.isoformat() if order.created_at else None,
        'admin_notes': order.admin_notes,
        'payment_receipt': payment_receipt_url,
    }


@receiver(post_save, sender=Order)
def order_saved(sender, instance, created, **kwargs):
    layer = _channel_layer()
    if not layer:
        return

    action = 'created' if created else 'updated'
    
    async_to_sync(layer.group_send)(
        'orders',
        {
            'type': 'order_update',
            'action': action,
            'order': get_order_data(instance)
        }
    )


@receiver(post_delete, sender=Order)
def order_deleted(sender, instance, **kwargs):
    layer = _channel_layer()
    if not layer:
        return
    
    async_to_sync(layer.group_send)(
        'orders',
        {
            'type': 'order_delete',
            'order_id': instance.id
        }
    )
