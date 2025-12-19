# مسیر: backend/apps/orders/serializers.py
from rest_framework import serializers
from .models import Order, OrderItem
from apps.products.models import Product

class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for OrderItem model with product details."""
    product = serializers.SerializerMethodField()
    
    class Meta:
        """Meta configuration for OrderItemSerializer."""
        model = OrderItem
        fields = ['product', 'quantity', 'price']
    
    def get_product(self, obj):
        """Get product details safely."""
        if obj.product:
            # ساخت URL کامل برای تصویر
            main_image_url = None
            if obj.product.main_image:
                request = self.context.get('request')
                if request:
                    main_image_url = request.build_absolute_uri(obj.product.main_image.url)
                else:
                    main_image_url = obj.product.main_image.url
            
            return {
                'id': obj.product.id,
                'title': obj.product.title,
                'main_image': main_image_url,
                'slug': obj.product.slug,
            }
        return {
            'id': None,
            'title': 'محصول حذف شده',
            'main_image': None,
            'slug': None,
        }


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for Order model with status validation for admin users only."""
    cart_items = serializers.ListField(write_only=True, required=False)
    items = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    
    def get_items(self, obj):
        """Get order items with context."""
        items = obj.items.all()
        serializer = OrderItemSerializer(items, many=True, context=self.context)
        return serializer.data
    
    class Meta:
        """Meta configuration for OrderSerializer."""
        model = Order
        fields = ['id', 'user', 'total_price', 'status', 'payment_method', 'payment_method_display', 'created_at', 'payment_receipt', 'admin_notes', 'cart_items', 'items']
        read_only_fields = ['total_price', 'created_at', 'payment_method']
    
    def get_user(self, obj):
        """Get user details safely."""
        if obj.user:
            return {
                'id': obj.user.id,
                'full_name': obj.user.full_name,
                'mobile': obj.user.mobile,
            }
        return {
            'id': None,
            'full_name': 'کاربر ناشناس',
            'mobile': 'نامشخص',
        } 

    def create(self, validated_data):
        """Create order with items from cart_items data."""
        cart_items = validated_data.pop('cart_items', [])
        order = Order.objects.create(**validated_data)
        
        total_price = 0
        
        for item_data in cart_items:
            try:
                product = Product.objects.get(id=item_data['product_id'])
                quantity = item_data.get('quantity', 1)
                price = product.discount_price or product.price
                
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    price=price
                )
                
                total_price += price * quantity
                
            except Product.DoesNotExist:
                continue
        
        order.total_price = total_price
        order.save()
        
        return order

    def validate_status(self, value):
        """Validate that only staff users can change order status."""
        request = self.context.get('request')
        if request and not request.user.is_staff:
            raise serializers.ValidationError("شما اجازه تغییر وضعیت سفارش را ندارید.")
        return value
    
    def validate_admin_notes(self, value):
        """Validate that only staff users can change admin notes."""
        request = self.context.get('request')
        if request and not request.user.is_staff:
            raise serializers.ValidationError("شما اجازه تغییر توضیحات ادمین را ندارید.")
        return value


class OrderReceiptSerializer(serializers.ModelSerializer):
    """Serializer for uploading payment receipts to orders."""
    
    class Meta:
        """Meta configuration for OrderReceiptSerializer."""
        model = Order
        fields = ['payment_receipt']
        
    def validate_payment_receipt(self, value):
        """Validate uploaded receipt file."""
        if value:
            # Check file size (max 5MB)
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("حجم فایل نباید بیشتر از 5 مگابایت باشد.")
            
            # Check file type
            allowed_types = ['image/jpeg', 'image/png', 'image/jpg']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError("فقط فایل‌های تصویری (JPG, PNG) مجاز هستند.")
        
        return value