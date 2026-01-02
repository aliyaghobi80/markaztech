from rest_framework import serializers
from .models import User, WalletChargeRequest, Ticket, TicketMessage, SiteStats, SatisfactionVote, SiteSettings
from django_jalali.serializers.serializerfield import JDateField
import jdatetime
import datetime

class PersianDateField(serializers.Field):
    """Custom field to handle Persian date conversion"""
    
    def to_representation(self, value):
        if value:
            # تبدیل تاریخ میلادی به جلالی برای نمایش
            if isinstance(value, datetime.date):
                j_date = jdatetime.date.fromgregorian(date=value)
                return j_date.strftime('%Y-%m-%d')
        return None
    
    def to_internal_value(self, data):
        if not data:
            return None
        
        try:
            # اگر تاریخ جلالی است، تبدیل به میلادی
            if isinstance(data, str):
                # پارس کردن تاریخ جلالی
                parts = data.replace('۰', '0').replace('۱', '1').replace('۲', '2').replace('۳', '3').replace('۴', '4').replace('۵', '5').replace('۶', '6').replace('۷', '7').replace('۸', '8').replace('۹', '9')
                year, month, day = map(int, parts.split('-'))
                j_date = jdatetime.date(year, month, day)
                return j_date.togregorian()
            elif hasattr(data, 'togregorian'):
                return data.togregorian()
            else:
                return data
        except (ValueError, AttributeError) as e:
            raise serializers.ValidationError(f'فرمت تاریخ نامعتبر است: {data}')

class SiteSettingsSerializer(serializers.ModelSerializer):
    site_logo_url = serializers.SerializerMethodField()
    hero_logo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = SiteSettings
        fields = ['id', 'site_name', 'site_logo', 'hero_logo', 'site_logo_url', 'hero_logo_url', 'site_description', 'contact_email', 'contact_phone']
    
    def get_site_logo_url(self, obj):
        if obj.site_logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.site_logo.url)
            return obj.site_logo.url
        return None
    
    def get_hero_logo_url(self, obj):
        if obj.hero_logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.hero_logo.url)
            return obj.hero_logo.url
        return None

class SiteStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteStats
        fields = ['total_visits']

class SatisfactionVoteSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    class Meta:
        model = SatisfactionVote
        fields = ['id', 'user', 'user_name', 'vote', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration with mobile number and optional avatar."""
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    birth_date = PersianDateField(required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = ['mobile', 'password', 'full_name', 'avatar', 'birth_date']

    def create(self, validated_data):
        avatar = validated_data.pop('avatar', None)
        birth_date = validated_data.pop('birth_date', None)
        
        # Since USERNAME_FIELD is commented out, we use mobile as username
        mobile = validated_data['mobile']
        user = User.objects.create_user(
            username=mobile,  # Use mobile as username
            password=validated_data['password'],
            mobile=mobile,
            full_name=validated_data.get('full_name', '')
        )
        if avatar:
            user.avatar = avatar
        if birth_date:
            user.birth_date = birth_date
        user.save()
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile with role detection."""
    role = serializers.SerializerMethodField()
    birth_date = PersianDateField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'mobile', 'full_name', 'email', 'avatar', 'wallet_balance', 'role', 'is_staff', 'is_superuser', 'birth_date']
        read_only_fields = ['mobile', 'wallet_balance', 'is_staff', 'is_superuser']

    def get_role(self, obj):
        if obj.is_staff or obj.is_superuser:
            return 'ADMIN'
        return 'CUSTOMER'

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer that accepts both mobile and username."""
    
    # Override the username field to be called mobile
    mobile = serializers.CharField()
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remove the original username field and add mobile
        if 'username' in self.fields:
            del self.fields['username']
    
    def validate(self, attrs):
        # Get mobile from the request
        username_or_mobile = attrs.get('mobile')
        password = attrs.get('password')
        
        if username_or_mobile and password:
            from django.contrib.auth import authenticate
            
            # Try to find user by mobile first
            try:
                user = User.objects.get(mobile=username_or_mobile)
            except User.DoesNotExist:
                # If not found by mobile, try username
                try:
                    user = User.objects.get(username=username_or_mobile)
                except User.DoesNotExist:
                    user = None
            
            if user and user.check_password(password):
                if not user.is_active:
                    raise serializers.ValidationError('حساب کاربری غیرفعال است.')
                
                # Create token manually
                from rest_framework_simplejwt.tokens import RefreshToken
                refresh = RefreshToken.for_user(user)
                
                return {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user_id': user.id,
                    'full_name': user.full_name or user.username,
                    'is_admin': user.is_staff or user.is_superuser
                }
        
        raise serializers.ValidationError('هیچ اکانت فعالی برای اطلاعات داده شده یافت نشد')

class UserSerializer(serializers.ModelSerializer):
    """Serializer for user list in admin panel."""
    role = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    birth_date = PersianDateField(required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'mobile', 'full_name', 'email', 'avatar', 'avatar_url', 'birth_date',
            'wallet_balance', 'role', 'is_staff', 'is_superuser', 'is_active', 'date_joined'
        ]
        read_only_fields = ['mobile', 'is_staff', 'is_superuser', 'date_joined', 'wallet_balance', 'role', 'avatar_url']

    def get_role(self, obj):
        if obj.is_staff or obj.is_superuser:
            return 'ADMIN'
        return 'CUSTOMER'
    
    def get_avatar_url(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None

class WalletChargeRequestSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()
    status = serializers.CharField(read_only=True)  # Explicitly define status field
    
    class Meta:
        model = WalletChargeRequest
        fields = ['id', 'user', 'user_details', 'amount', 'receipt_image', 'status', 'admin_note', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'status']
    
    def get_user_details(self, obj):
        return {
            'id': obj.user.id,
            'mobile': obj.user.mobile,
            'full_name': obj.user.full_name,
            'wallet_balance': obj.user.wallet_balance,
        }

class WalletChargeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletChargeRequest
        fields = ['amount', 'receipt_image']

class WalletAdjustmentSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=0)

class TicketMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    sender_role = serializers.CharField(source='sender.role', read_only=True)
    is_me = serializers.SerializerMethodField()

    class Meta:
        model = TicketMessage
        fields = ['id', 'ticket', 'sender', 'sender_name', 'sender_role', 'message', 'attachment', 'created_at', 'is_me']
        read_only_fields = ['id', 'ticket', 'sender', 'created_at']

    def get_is_me(self, obj):
        user = self.context['request'].user
        return obj.sender == user

    def validate_attachment(self, value):
        if value:
            # 10MB = 10 * 1024 * 1024 bytes
            if value.size > 10 * 1024 * 1024:
                raise serializers.ValidationError("اندازه فایل نباید بیشتر از 10 مگابایت باشد.")
            
            # Allow only images for now if that's what user implied, 
            # but they said "عکس هم ارسال کرد" so let's stick to images or common formats.
            import os
            ext = os.path.splitext(value.name)[1].lower()
            valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.zip']
            if ext not in valid_extensions:
                raise serializers.ValidationError("فرمت فایل مجاز نیست.")
        return value

class TicketSerializer(serializers.ModelSerializer):
    user_mobile = serializers.CharField(source='user.mobile', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = ['id', 'user', 'user_mobile', 'user_name', 'subject', 'status', 'created_at', 'updated_at', 'last_message']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return {
                'message': last_msg.message[:50],
                'created_at': last_msg.created_at,
                'sender_name': last_msg.sender.full_name
            }
        return None
