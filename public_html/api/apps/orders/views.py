# مسیر: backend/apps/orders/views.py

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse
from .models import Order
from .serializers import OrderSerializer, OrderReceiptSerializer
from .pdf_generator import generate_order_pdf

class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet for managing orders with user-specific access control."""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return orders based on user role - all for admin, user-specific for customers."""
        user = self.request.user
        # اگر کاربر ادمین است، همه سفارش‌ها را ببیند
        if user.is_staff:
            return Order.objects.all().order_by('-created_at')
        # اگر کاربر عادی است، فقط سفارش‌های خود را ببیند
        return Order.objects.filter(user=user).order_by('-created_at')

    def perform_create(self, serializer):
        """Automatically assign the current user to the order."""
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        """Handle order updates with proper validation."""
        # اینجا می‌توانید چک کنید اگر ادمین است اجازه آپدیت داشته باشد
        order = serializer.instance
        
        # Only allow status changes by staff users
        if 'status' in serializer.validated_data and not self.request.user.is_staff:
            # Remove status from validated_data if user is not staff
            serializer.validated_data.pop('status', None)
            
        serializer.save()

    @action(detail=True, methods=['post'], serializer_class=OrderReceiptSerializer, parser_classes=[MultiPartParser, FormParser])
    def upload_receipt(self, request, pk=None):
        """Upload payment receipt for an order."""
        print(f"DEBUG: Upload receipt called for order {pk}")
        print(f"DEBUG: User: {request.user}")
        print(f"DEBUG: Files: {request.FILES}")
        print(f"DEBUG: Data: {request.data}")
        
        try:
            order = self.get_object()
            print(f"DEBUG: Order found: {order}")
        except Order.DoesNotExist:
            print("DEBUG: Order not found")
            return Response(
                {'error': 'سفارش یافت نشد'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Ensure user can only upload receipt for their own orders
        if order.user != request.user and not request.user.is_staff:
            print(f"DEBUG: Permission denied. Order user: {order.user}, Request user: {request.user}")
            return Response(
                {'error': 'شما فقط می‌توانید برای سفارش‌های خود فیش آپلود کنید'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if file is provided
        if 'payment_receipt' not in request.FILES:
            print("DEBUG: No file provided")
            return Response(
                {'error': 'فایل رسید پرداخت ارسال نشده است'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(order, data=request.data, partial=True)
        print(f"DEBUG: Serializer valid: {serializer.is_valid()}")
        if not serializer.is_valid():
            print(f"DEBUG: Serializer errors: {serializer.errors}")
        
        if serializer.is_valid():
            serializer.save()
            # Update status to pending after receipt upload
            order.status = Order.Status.PENDING 
            order.payment_method = Order.PaymentMethod.CARD
            order.save()
            print("DEBUG: Upload successful")
            return Response({
                'status': 'Receipt uploaded successfully',
                'message': 'فیش پرداخت با موفقیت آپلود شد'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def pay_with_wallet(self, request, pk=None):
        """Pay for an order using wallet balance."""
        try:
            order = self.get_object()
        except Order.DoesNotExist:
            return Response(
                {'error': 'سفارش یافت نشد'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        if order.user != request.user:
            return Response(
                {'error': 'شما فقط می‌توانید سفارش‌های خود را پرداخت کنید'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if order.status != Order.Status.PENDING:
            return Response(
                {'error': 'این سفارش قبلاً پرداخت شده است'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = request.user
        
        # برای محصولات رایگان، نیازی به چک موجودی نیست
        if order.total_price > 0 and user.wallet_balance < order.total_price:
            return Response(
                {
                    'error': 'موجودی کیف پول کافی نیست',
                    'wallet_balance': user.wallet_balance,
                    'required_amount': order.total_price,
                    'shortage': order.total_price - user.wallet_balance
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from django.db import transaction
        from apps.users.utils import send_product_update
        with transaction.atomic():
            # فقط اگر مبلغ بیشتر از صفر باشد، از کیف پول کسر کن
            if order.total_price > 0:
                user.wallet_balance -= order.total_price
                user.save()
            
            order.status = Order.Status.PAID
            order.payment_method = Order.PaymentMethod.WALLET
            order.save()
            
            # Decrease stock
            for item in order.items.all():
                if item.product.stock >= item.quantity:
                    item.product.stock -= item.quantity
                    item.product.save()
                    send_product_update(item.product)
                else:
                    # In a real app, you'd handle this case (e.g., refund or error)
                    # For now, we just set to 0
                    item.product.stock = 0
                    item.product.save()
                    send_product_update(item.product)
        
        return Response({
            'message': 'پرداخت با موفقیت انجام شد' if order.total_price > 0 else 'محصول رایگان با موفقیت دریافت شد',
            'order_id': order.id,
            'paid_amount': order.total_price,
            'new_wallet_balance': user.wallet_balance,
            'is_free': order.total_price == 0
        })

    @action(detail=True, methods=['get'])
    def download_pdf(self, request, pk=None):
        """Download PDF receipt for a paid order."""
        try:
            order = self.get_object()
        except Order.DoesNotExist:
            return Response(
                {'error': 'سفارش یافت نشد'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # بررسی دسترسی - فقط صاحب سفارش یا ادمین
        if order.user != request.user and not request.user.is_staff:
            return Response(
                {'error': 'شما فقط می‌توانید PDF سفارش‌های خود را دانلود کنید'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # بررسی وضعیت پرداخت - فقط سفارشات پرداخت شده
        if order.status != Order.Status.PAID:
            return Response(
                {'error': 'فقط سفارشات پرداخت شده قابل دانلود هستند'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # تولید PDF
            return generate_order_pdf(order)
        except Exception as e:
            print(f"Error generating PDF: {e}")
            return Response(
                {'error': 'خطا در تولید فایل PDF'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )