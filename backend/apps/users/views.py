# backend/apps/users/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

from .serializers import UserSerializer, UserRegistrationSerializer, CustomTokenObtainPairSerializer, WalletTopUpRequestSerializer, WalletTopUpCreateSerializer
from .models import WalletTopUpRequest
from decimal import Decimal


User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token obtain pair view with additional user data."""
    serializer_class = CustomTokenObtainPairSerializer

class UserRegistrationView(APIView):
    """API view for user registration with file upload support."""
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        """Register a new user with mobile number, password, and optional avatar."""
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            avatar_url = None
            if user.avatar:
                avatar_url = request.build_absolute_uri(user.avatar.url)
            
            return Response({
                'message': 'کاربر با موفقیت ثبت شد',
                'user_id': user.id,
                'mobile': user.mobile,
                'full_name': user.full_name,
                'avatar': avatar_url
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for managing users. Only accessible by admin users."""
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    # این خط میگه فقط ادمین بتونه لیست همه رو ببینه یا حذف کنه
    permission_classes = [permissions.IsAdminUser]
    
    def get_serializer_context(self):
        """Pass request context to serializer for building absolute URLs."""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class ProfileViewSet(viewsets.ViewSet):
    """ViewSet for user profile management including image uploads."""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser] # برای آپلود عکس

    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        """Get or update the current user's profile data."""
        user = request.user
        if request.method == 'GET':
            serializer = UserSerializer(user, context={'request': request})
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            # اینجا برای ویرایش پروفایل و آپلود عکس
            serializer = UserSerializer(user, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                # Return updated data with full avatar URL
                updated_serializer = UserSerializer(user, context={'request': request})
                return Response(updated_serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'error': 'Method not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


class WalletTopUpViewSet(viewsets.ModelViewSet):
    """ViewSet for wallet top-up requests."""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return WalletTopUpCreateSerializer
        return WalletTopUpRequestSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return WalletTopUpRequest.objects.all().order_by('-created_at')
        return WalletTopUpRequest.objects.filter(user=user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a wallet top-up request (Admin only)."""
        if not request.user.is_staff:
            return Response({'error': 'دسترسی فقط برای ادمین'}, status=status.HTTP_403_FORBIDDEN)
        
        topup_request = self.get_object()
        
        if topup_request.status != WalletTopUpRequest.Status.PENDING:
            return Response({'error': 'این درخواست قبلا پردازش شده است'}, status=status.HTTP_400_BAD_REQUEST)
        
        topup_request.status = WalletTopUpRequest.Status.APPROVED
        topup_request.admin_note = request.data.get('admin_note', '')
        topup_request.save()
        
        topup_request.user.wallet_balance += Decimal(topup_request.amount)
        topup_request.user.save()
        
        return Response({
            'message': 'درخواست تایید شد و موجودی کیف پول بروزرسانی شد',
            'new_balance': topup_request.user.wallet_balance
        })
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a wallet top-up request (Admin only)."""
        if not request.user.is_staff:
            return Response({'error': 'دسترسی فقط برای ادمین'}, status=status.HTTP_403_FORBIDDEN)
        
        topup_request = self.get_object()
        
        if topup_request.status != WalletTopUpRequest.Status.PENDING:
            return Response({'error': 'این درخواست قبلا پردازش شده است'}, status=status.HTTP_400_BAD_REQUEST)
        
        topup_request.status = WalletTopUpRequest.Status.REJECTED
        topup_request.admin_note = request.data.get('admin_note', 'رد شده توسط ادمین')
        topup_request.save()
        
        return Response({'message': 'درخواست رد شد'})


class WalletPurchaseView(APIView):
    """API view for purchasing products using wallet balance."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Process a wallet purchase."""
        from apps.products.models import Product
        from apps.orders.models import Order, OrderItem
        
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        
        if not product_id:
            return Response({'error': 'شناسه محصول الزامی است'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'محصول یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
        
        price = product.discount_price if product.discount_price else product.price
        total_price = price * quantity
        
        if request.user.wallet_balance < total_price:
            return Response({
                'error': 'موجودی کیف پول کافی نیست',
                'required': total_price,
                'balance': request.user.wallet_balance,
                'shortage': total_price - request.user.wallet_balance
            }, status=status.HTTP_400_BAD_REQUEST)
        
        order = Order.objects.create(
            user=request.user,
            total_price=total_price,
            status=Order.Status.PAID
        )
        
        OrderItem.objects.create(
            order=order,
            product=product,
            quantity=quantity,
            price=price
        )
        
        request.user.wallet_balance -= Decimal(total_price)
        request.user.save()
        
        return Response({
            'message': 'خرید با موفقیت انجام شد',
            'order_id': order.id,
            'total_price': total_price,
            'new_balance': request.user.wallet_balance
        }, status=status.HTTP_201_CREATED)