# backend/apps/users/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Sum, Q

from .serializers import (
    UserSerializer, UserRegistrationSerializer, CustomTokenObtainPairSerializer,
    WalletChargeRequestSerializer, WalletChargeCreateSerializer, WalletAdjustmentSerializer,
    TicketSerializer, TicketMessageSerializer, SiteStatsSerializer, SatisfactionVoteSerializer,
    SiteSettingsSerializer
)
from .models import WalletChargeRequest, Ticket, TicketMessage, SiteStats, SatisfactionVote, SiteSettings

class SiteStatsView(APIView):
    """View for site-wide statistics."""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        stats, created = SiteStats.objects.get_or_create(id=1)
        
        # Calculate satisfaction stats
        total_votes = SatisfactionVote.objects.count()
        satisfied_votes = SatisfactionVote.objects.filter(vote='satisfied').count()
        satisfaction_rate = (satisfied_votes / total_votes * 100) if total_votes > 0 else 100
        
        # Get online users count
        from .consumers import online_user_connections
        online_users = len(online_user_connections)
        
        return Response({
            'total_visits': stats.total_visits,
            'today_visits': stats.today_visits,
            'online_users': online_users,
            'total_satisfied_customers': satisfied_votes,
            'satisfaction_rate': round(satisfaction_rate, 1),
            'total_votes': total_votes
        })

class SiteSettingsView(APIView):
    """View for managing site settings."""
    
    def get(self, request):
        """Get current site settings."""
        settings = SiteSettings.get_settings()
        serializer = SiteSettingsSerializer(settings, context={'request': request})
        return Response(serializer.data)
    
    def put(self, request):
        """Update site settings (Admin only)."""
        print(f"DEBUG: Site settings PUT request received")
        print(f"DEBUG: User: {request.user}")
        print(f"DEBUG: Is staff: {request.user.is_staff}")
        print(f"DEBUG: Request data: {request.data}")
        print(f"DEBUG: Request files: {request.FILES}")
        
        if not request.user.is_staff:
            return Response({'error': 'فقط مدیران مجاز به تغییر تنظیمات هستند.'}, status=status.HTTP_403_FORBIDDEN)
        
        settings = SiteSettings.get_settings()
        serializer = SiteSettingsSerializer(settings, data=request.data, partial=True, context={'request': request})
        
        if serializer.is_valid():
            print(f"DEBUG: Serializer is valid, saving...")
            serializer.save()
            
            # Broadcast settings update to all connected clients
            from .utils import broadcast_site_settings_update
            broadcast_site_settings_update(serializer.data)
            
            print(f"DEBUG: Settings saved successfully")
            return Response(serializer.data)
        else:
            print(f"DEBUG: Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SatisfactionVoteViewSet(viewsets.ModelViewSet):
    """ViewSet for managing customer satisfaction votes."""
    queryset = SatisfactionVote.objects.all()
    serializer_class = SatisfactionVoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Check if user has at least one paid order
        from apps.orders.models import Order
        has_purchased = Order.objects.filter(user=self.request.user, status__in=[Order.Status.PAID, Order.Status.SENT]).exists()
        
        if not has_purchased:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("فقط کاربرانی که خرید انجام داده‌اند می‌توانند در نظرسنجی شرکت کنند.")
            
        serializer.save(user=self.request.user)
        # from .utils import broadcast_site_stats
        # broadcast_site_stats()

    @action(detail=False, methods=['get'])
    def my_vote(self, request):
        vote = SatisfactionVote.objects.filter(user=request.user).first()
        if vote:
            return Response(SatisfactionVoteSerializer(vote).data)
        return Response({'vote': None})
from .utils import send_wallet_update, send_wallet_request_update, send_ticket_update


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
        from apps.articles.models import Article
        from django.utils import timezone
        from django.db.models import Sum
        import datetime
        
        # Get visit stats
        stats, created = SiteStats.objects.get_or_create(id=1)
        
        # Today's start
        today = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        total_users = User.objects.count()
        total_products = Product.objects.count()
        total_articles = Article.objects.count()
        
        # Orders stats
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status=Order.Status.PENDING).count()
        new_orders_today = Order.objects.filter(created_at__gte=today).count()
        
        # Sales stats
        total_sales = Order.objects.filter(
            status__in=[Order.Status.PAID, Order.Status.SENT]
        ).aggregate(total=Sum('total_price'))['total'] or 0
        
        sales_today = Order.objects.filter(
            status__in=[Order.Status.PAID, Order.Status.SENT],
            created_at__gte=today
        ).aggregate(total=Sum('total_price'))['total'] or 0
        
        # User stats
        new_users_today = User.objects.filter(date_joined__gte=today).count()
        
        return Response({
            'total_users': total_users,
            'new_users_today': new_users_today,
            'total_products': total_products,
            'total_articles': total_articles,
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'new_orders_today': new_orders_today,
            'total_sales': total_sales,
            'sales_today': sales_today,
            'today_visits': stats.today_visits,
            'total_visits': stats.total_visits,
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
        # Handle both JSON and form data
        if request.content_type == 'application/json':
            import json
            try:
                data = json.loads(request.body)
            except json.JSONDecodeError:
                return Response({'error': 'Invalid JSON'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            data = request.data
            
        serializer = UserRegistrationSerializer(data=data)
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
    permission_classes = [permissions.IsAdminUser]
    
    def get_serializer_context(self):
        """Pass request context to serializer for building absolute URLs."""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class ProfileViewSet(viewsets.ViewSet):
    """ViewSet for user profile management including image uploads."""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        """Get or update the current user's profile data."""
        user = request.user
        if request.method == 'GET':
            serializer = UserSerializer(user, context={'request': request})
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            print(f"DEBUG: Received PATCH request")
            print(f"DEBUG: request.data = {request.data}")
            print(f"DEBUG: request.FILES = {request.FILES}")
            
            serializer = UserSerializer(user, data=request.data, partial=True, context={'request': request})
            print(f"DEBUG: Serializer is_valid = {serializer.is_valid()}")
            
            if serializer.is_valid():
                print(f"DEBUG: Validated data = {serializer.validated_data}")
                serializer.save()
                updated_serializer = UserSerializer(user, context={'request': request})
                return Response(updated_serializer.data)
            else:
                print(f"DEBUG: Serializer errors = {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'error': 'Method not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


class WalletChargeRequestViewSet(viewsets.ModelViewSet):
    serializer_class = WalletChargeRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return WalletChargeRequest.objects.all().order_by('-created_at')
        return WalletChargeRequest.objects.filter(user=user).order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return WalletChargeCreateSerializer
        return WalletChargeRequestSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def debug_status(self, request, pk=None):
        """Debug endpoint to check current status"""
        wallet_request = self.get_object()
        return Response({
            'id': wallet_request.id,
            'status': wallet_request.status,
            'admin_note': wallet_request.admin_note,
            'updated_at': wallet_request.updated_at
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        wallet_request = self.get_object()
        print(f"Approving wallet request {pk}, current status: {wallet_request.status}")
        
        if wallet_request.status != 'pending':
            return Response({'error': 'این درخواست قبلاً بررسی شده است.'}, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            wallet_request.status = 'approved'
            wallet_request.admin_note = request.data.get('admin_note', '')
            wallet_request.save()
            print(f"Wallet request {pk} status updated to: {wallet_request.status}")
            
            user = wallet_request.user
            old_balance = user.wallet_balance
            user.wallet_balance += wallet_request.amount
            user.save()
            print(f"User {user.id} balance updated from {old_balance} to {user.wallet_balance}")
            
            transaction.on_commit(lambda: send_wallet_update(user))
            transaction.on_commit(lambda: send_wallet_request_update(user, wallet_request.id, 'approved', wallet_request.admin_note))
        
        return Response({
            'message': 'درخواست تایید شد.',
            'new_balance': user.wallet_balance,
            'status': wallet_request.status
        })
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        wallet_request = self.get_object()
        print(f"Rejecting wallet request {pk}, current status: {wallet_request.status}")
        
        if wallet_request.status != 'pending':
            return Response({'error': 'این درخواست قبلاً بررسی شده است.'}, status=status.HTTP_400_BAD_REQUEST)
        
        wallet_request.status = 'rejected'
        wallet_request.admin_note = request.data.get('admin_note', 'درخواست توسط ادمین رد شد.')
        wallet_request.save()
        print(f"Wallet request {pk} status updated to: {wallet_request.status}")
        
        send_wallet_request_update(wallet_request.user, wallet_request.id, 'rejected', wallet_request.admin_note)
        return Response({
            'message': 'درخواست رد شد.',
            'status': wallet_request.status
        })


class AdminWalletAdjustmentView(APIView):
    permission_classes = [permissions.IsAdminUser]
    def post(self, request):
        serializer = WalletAdjustmentSerializer(data=request.data)
        if not serializer.is_valid(): return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user_id = serializer.validated_data['user_id']
        amount = serializer.validated_data['amount']
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'کاربر یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)
        
        user.wallet_balance += amount
        user.save()
        send_wallet_update(user)
        return Response({'message': 'موجودی تغییر کرد.', 'new_balance': user.wallet_balance})


class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Ticket.objects.all()
        return Ticket.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def add_message(self, request, pk=None):
        ticket = self.get_object()
        serializer = TicketMessageSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(ticket=ticket, sender=request.user)
            # Update ticket status
            if request.user.is_staff:
                ticket.status = Ticket.Status.OPEN
            else:
                ticket.status = Ticket.Status.PENDING
            ticket.save()
            
            # Send real-time update
            send_ticket_update(ticket)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        ticket = self.get_object()
        messages = ticket.messages.all()
        serializer = TicketMessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path=r'delete_message/(?P<message_id>\d+)', permission_classes=[permissions.IsAdminUser])
    def delete_message(self, request, pk=None, message_id=None):
        ticket = self.get_object()
        try:
            message = ticket.messages.get(id=message_id)
            message.delete()
            return Response({'status': 'message deleted'})
        except TicketMessage.DoesNotExist:
            return Response({'error': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def close(self, request, pk=None):
        ticket = self.get_object()
        ticket.status = Ticket.Status.CLOSED
        ticket.save()
        send_ticket_update(ticket)
        return Response({'status': 'ticket closed'})
