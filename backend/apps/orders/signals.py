from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Order

def get_order_data(order):
    return {
        'id': order.id,
        'user_id': order.user.id if order.user else None,
        'user_name': order.user.full_name if order.user and order.user.full_name else 'نامشخص',
        'user_mobile': order.user.mobile if order.user and order.user.mobile else 'نامشخص',
        'total_price': order.total_price,
        'status': order.status,
        'created_at': order.created_at.isoformat() if order.created_at else None,
        'admin_notes': order.admin_notes,
        'receipt_image': order.receipt_image.url if order.receipt_image else None,
    }

@receiver(post_save, sender=Order)
def order_saved(sender, instance, created, **kwargs):
    channel_layer = get_channel_layer()
    
    action = 'created' if created else 'updated'
    
    async_to_sync(channel_layer.group_send)(
        'orders',
        {
            'type': 'order_update',
            'action': action,
            'order': get_order_data(instance)
        }
    )

@receiver(post_delete, sender=Order)
def order_deleted(sender, instance, **kwargs):
    channel_layer = get_channel_layer()
    
    async_to_sync(channel_layer.group_send)(
        'orders',
        {
            'type': 'order_delete',
            'order_id': instance.id
        }
    )