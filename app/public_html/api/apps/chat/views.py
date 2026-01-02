# مسیر: backend/apps/chat/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from .models import ChatRoom, ChatMessage, AdminOnlineStatus
from .serializers import ChatRoomSerializer, ChatMessageSerializer, AdminOnlineStatusSerializer, GuestChatSerializer
from .utils import send_chat_message_update

class ChatRoomViewSet(viewsets.ModelViewSet):
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            # ادمین همه چت‌ها را می‌بیند
            return ChatRoom.objects.filter(is_active=True)
        else:
            # کاربر فقط چت‌های خودش را می‌بیند
            return ChatRoom.objects.filter(user=user, is_active=True)
    
    def create(self, request):
        """ایجاد یا بازیابی اتاق چت برای کاربر"""
        try:
            user = request.user
            
            if not user.is_authenticated:
                return Response({'error': 'کاربر احراز هویت نشده است'}, status=status.HTTP_401_UNAUTHORIZED)
            
            # بررسی اینکه آیا کاربر قبلاً اتاق چت فعال دارد
            existing_room = ChatRoom.objects.filter(user=user, is_active=True).first()
            
            if existing_room:
                # اگر اتاق موجود است، همان را برگردان
                serializer = self.get_serializer(existing_room)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                # اگر اتاق موجود نیست، یکی جدید بساز
                room = ChatRoom.objects.create(user=user, is_active=True)
                serializer = self.get_serializer(room)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            print(f"Error creating chat room: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': 'خطا در ایجاد اتاق چت'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """دریافت پیام‌های یک اتاق چت"""
        room = self.get_object()
        messages = room.messages.all()
        
        # علامت‌گذاری پیام‌ها به عنوان خوانده شده
        if request.user.is_staff:
            messages.filter(sender_type='user', is_read=False).update(is_read=True)
        else:
            messages.filter(sender_type='admin', is_read=False).update(is_read=True)
        
        serializer = ChatMessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """ارسال پیام در اتاق چت"""
        room = self.get_object()
        message_text = request.data.get('message', '').strip()
        message_type = request.data.get('message_type', 'text')
        
        # بررسی نوع پیام
        if message_type == 'text' and not message_text:
            return Response({'error': 'پیام نمی‌تواند خالی باشد'}, status=status.HTTP_400_BAD_REQUEST)
        
        # تعیین نوع فرستنده
        sender_type = 'admin' if request.user.is_staff else 'user'
        
        # ایجاد پیام
        message_data = {
            'room': room,
            'sender': request.user,
            'sender_type': sender_type,
            'message_type': message_type,
            'message': message_text
        }
        
        # پردازش فایل‌ها بر اساس نوع پیام
        if message_type == 'image' and 'image' in request.FILES:
            image_file = request.FILES['image']
            message_data['image'] = image_file
            message_data['file_name'] = image_file.name
            message_data['file_size'] = image_file.size
            message_data['message'] = message_text or 'تصویر ارسال شد'
            
        elif message_type == 'audio' and 'audio' in request.FILES:
            audio_file = request.FILES['audio']
            message_data['audio'] = audio_file
            message_data['file_name'] = audio_file.name
            message_data['file_size'] = audio_file.size
            message_data['message'] = message_text or 'پیام صوتی ارسال شد'
            
        elif message_type == 'file' and 'file' in request.FILES:
            file_obj = request.FILES['file']
            message_data['file'] = file_obj
            message_data['file_name'] = file_obj.name
            message_data['file_size'] = file_obj.size
            message_data['message'] = message_text or f'فایل {file_obj.name} ارسال شد'
        
        message = ChatMessage.objects.create(**message_data)
        
        # بروزرسانی زمان اتاق چت
        room.updated_at = timezone.now()
        room.save()
        
        # ارسال به WebSocket
        send_chat_message_update(room, message)
        
        serializer = ChatMessageSerializer(message, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class AdminOnlineStatusViewSet(viewsets.ReadOnlyModelViewSet):
    """مشاهده وضعیت آنلاین ادمین‌ها"""
    serializer_class = AdminOnlineStatusSerializer
    permission_classes = [permissions.AllowAny]  # همه می‌توانند ببینند
    
    def get_queryset(self):
        return AdminOnlineStatus.objects.filter(admin__is_staff=True)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def update_status(self, request):
        """بروزرسانی وضعیت آنلاین ادمین"""
        is_online = request.data.get('is_online', True)
        
        print(f"🔄 Admin {request.user.username} updating status to: {is_online}")
        
        status_obj, created = AdminOnlineStatus.objects.get_or_create(
            admin=request.user,
            defaults={'is_online': is_online, 'last_seen': timezone.now()}
        )
        
        if not created:
            status_obj.is_online = is_online
            status_obj.last_seen = timezone.now()
            status_obj.save()
        
        print(f"✅ Admin status updated: {status_obj.admin.username} - {status_obj.is_online}")
        
        serializer = self.get_serializer(status_obj)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def force_online(self, request):
        """تنظیم اجباری وضعیت آنلاین برای تست"""
        from apps.users.models import User
        
        # پیدا کردن اولین ادمین
        admin_user = User.objects.filter(is_staff=True).first()
        if not admin_user:
            return Response({'error': 'No admin user found'}, status=400)
        
        status_obj, created = AdminOnlineStatus.objects.get_or_create(
            admin=admin_user,
            defaults={'is_online': True, 'last_seen': timezone.now()}
        )
        
        status_obj.is_online = True
        status_obj.last_seen = timezone.now()
        status_obj.save()
        
        print(f"🔧 Force set admin {admin_user.username} online")
        
        return Response({'message': f'Admin {admin_user.username} set online'})

class GuestChatViewSet(viewsets.ViewSet):
    """چت مهمان‌ها"""
    permission_classes = [permissions.AllowAny]
    
    def create(self, request):
        """شروع چت توسط مهمان"""
        serializer = GuestChatSerializer(data=request.data)
        if serializer.is_valid():
            phone = serializer.validated_data['phone']
            message_text = serializer.validated_data['message']
            
            # ایجاد یا بازیابی اتاق چت برای مهمان
            room, created = ChatRoom.objects.get_or_create(
                guest_phone=phone,
                user=None,
                defaults={'is_active': True}
            )
            
            # ایجاد پیام
            message = ChatMessage.objects.create(
                room=room,
                sender=None,
                sender_type='user',
                message=message_text
            )
            
            # بروزرسانی زمان اتاق چت
            room.updated_at = timezone.now()
            room.save()
            
            # ارسال به WebSocket
            send_chat_message_update(room, message)
            
            return Response({
                'room_id': room.id,
                'message': 'پیام شما ارسال شد. به زودی پاسخ داده خواهد شد.'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)