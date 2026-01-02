# مسیر: backend/apps/orders/models.py
from django.db import models
from django.conf import settings
from apps.products.models import Product

class Order(models.Model):
    """Customer order model with payment tracking."""
    
    class Status(models.TextChoices):
        """Order status choices."""
        PENDING = 'PENDING', 'در انتظار پرداخت'
        PAID = 'PAID', 'پرداخت شده'
        CANCELED = 'CANCELED', 'لغو شده'
        SENT = 'SENT', 'تحویل داده شده'

    class PaymentMethod(models.TextChoices):
        """Payment method choices."""
        WALLET = 'WALLET', 'کیف پول'
        CARD = 'CARD', 'کارت به کارت'
        ONLINE = 'ONLINE', 'درگاه مستقیم'
        NONE = 'NONE', 'نامشخص'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField('وضعیت', max_length=20, choices=Status.choices, default=Status.PENDING)
    payment_method = models.CharField('روش پرداخت', max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.NONE)
    total_price = models.PositiveBigIntegerField('مبلغ کل (تومان)', default=0)
    created_at = models.DateTimeField('تاریخ ثبت', auto_now_add=True)
    
    # برای پرداخت کارت به کارت
    payment_receipt = models.ImageField('رسید پرداخت', upload_to='receipts/', blank=True, null=True)
    
    # توضیحات ادمین برای سفارش
    admin_notes = models.TextField('توضیحات ادمین', blank=True, null=True, help_text='توضیحات اکانت و اطلاعات تحویل')

    def __str__(self):
        return f"سفارش {self.id} - {self.user.mobile}"

class OrderItem(models.Model):
    """Individual items within an order."""
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField('تعداد', default=1)
    price = models.PositiveBigIntegerField('قیمت واحد در لحظه خرید')

    def __str__(self):
        return f"{self.quantity} x {self.product.title}"