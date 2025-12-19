# backend/apps/users/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Sum

from .serializers import (
    UserSerializer, UserRegistrationSerializer, CustomTokenObtainPairSerializer,
    WalletTopUpRequestSerializer, WalletTopUpCreateSerializer, WalletAdjustmentSerializer
)
from .models import WalletTopUpRequest
from .utils import send_wallet_update


User = get_user_model()


from rest_framework_simplejwt.tokens import RefreshToken

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({"message": "خروج با موفقیت انجام شد"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response({"error": "توکن نامعتبر است"}, status=status.HTTP_400_BAD_REQUEST)

class AdminStatisticsView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        from apps.orders.models import Order
        from apps.products.models import Product
        
        total_users = User.objects.count()
        total_products = Product.objects.count()
        active_products = Product.objects.filter(is_active=True).count()
        
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status=Order.Status.PENDING).count()
        paid_orders = Order.objects.filter(status=Order.Status.PAID).count()
        
        total_sales = Order.objects.filter(
            status__in=[Order.Status.PAID, Order.Status.SENT]
        ).aggregate(total=Sum('total_price'))['total'] or 0
        
        pending_wallet_requests = WalletTopUpRequest.objects.filter(
            status=WalletTopUpRequest.Status.PENDING
        ).count()
        
        return Response({
            'total_users': total_users,
            'total_products': total_products,
            'active_products': active_products,
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'paid_orders': paid_orders,
            'total_sales': total_sales,
            'pending_wallet_requests': pending_wallet_requests,
        })


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


class WalletTopUpRequestViewSet(viewsets.ModelViewSet):
    serializer_class = WalletTopUpRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return WalletTopUpRequest.objects.all().order_by('-created_at')
        return WalletTopUpRequest.objects.filter(user=user).order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return WalletTopUpCreateSerializer
        return WalletTopUpRequestSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        wallet_request = self.get_object()
        
        if wallet_request.status != WalletTopUpRequest.Status.PENDING:
            return Response(
                {'error': 'این درخواست قبلاً بررسی شده است.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            wallet_request.status = WalletTopUpRequest.Status.APPROVED
            wallet_request.admin_note = request.data.get('admin_note', '')
            wallet_request.save()
            
            user = wallet_request.user
            user.wallet_balance += wallet_request.amount
            user.save()
            
            # ارسال نوتیفیکیشن ریل‌تایم
            send_wallet_update(user)
        
        return Response({
            'message': 'درخواست تایید شد و موجودی کیف پول کاربر افزایش یافت.',
            'new_balance': user.wallet_balance
        })
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        wallet_request = self.get_object()
        
        if wallet_request.status != WalletTopUpRequest.Status.PENDING:
            return Response(
                {'error': 'این درخواست قبلاً بررسی شده است.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        wallet_request.status = WalletTopUpRequest.Status.REJECTED
        wallet_request.admin_note = request.data.get('admin_note', 'درخواست توسط ادمین رد شد.')
        wallet_request.save()
        
        return Response({'message': 'درخواست رد شد.'})


class AdminWalletAdjustmentView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request):
        serializer = WalletAdjustmentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user_id = serializer.validated_data['user_id']
        amount = serializer.validated_data['amount']
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'کاربر یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)
        
        new_balance = user.wallet_balance + amount
        if new_balance < 0:
            return Response(
                {'error': 'موجودی کیف پول نمی‌تواند منفی شود.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.wallet_balance = new_balance
        user.save()
        
        # ارسال نوتیفیکیشن ریل‌تایم
        send_wallet_update(user)
        
        return Response({
            'message': 'موجودی کیف پول با موفقیت تغییر کرد.',
            'user_id': user.id,
            'new_balance': user.wallet_balance
        })