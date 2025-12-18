# مسیر: backend/apps/users/serializers.py

from rest_framework import serializers
from .models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration with mobile number and optional avatar."""
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    
    class Meta:
        """Meta configuration for UserRegistrationSerializer."""
        model = User
        fields = ['mobile', 'password', 'full_name', 'avatar']

    def create(self, validated_data):
        """Create a new user with encrypted password and optional avatar."""
        avatar = validated_data.pop('avatar', None)
        user = User.objects.create_user(
            mobile=validated_data['mobile'],
            password=validated_data['password'],
            full_name=validated_data.get('full_name', '')
        )
        if avatar:
            user.avatar = avatar
            user.save()
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile with role detection."""
    # 🔴 تغییر مهم: تعریف دستی فیلد نقش
    role = serializers.SerializerMethodField()

    class Meta:
        """Meta configuration for UserProfileSerializer."""
        model = User
        fields = ['id', 'mobile', 'full_name', 'email', 'avatar', 'wallet_balance', 'is_staff', 'is_superuser']
        read_only_fields = ['mobile', 'wallet_balance', 'is_staff', 'is_superuser']

    def get_role(self, obj):
        """Determine user role based on staff and superuser status."""
        # اگر کاربر دسترسی مدیریت (is_staff) یا ادمین کل (is_superuser) داشت
        if obj.is_staff or obj.is_superuser:
            return 'ADMIN'
        return 'USER'

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer using mobile number instead of username."""
    # این خط میگه که فیلد اصلی ما mobile هست، نه username
    username_field = 'mobile'

    def validate(self, attrs):
        """Validate credentials and add user info to token response."""
        # این متد میگه اگر توی جیسون کلید mobile اومد، اون رو بذار جای username
        # چون کلاس والد (Parent) انتظار داره دیتا توی self.username_field باشه
        data = super().validate(attrs)
        
        # (اختیاری) اگر بخوایم توی پاسخ لاگین، مشخصات کاربر رو هم بفرستیم:
        data['user_id'] = self.user.id
        data['full_name'] = self.user.full_name
        data['is_admin'] = self.user.is_staff
        
        return data

from .models import WalletTopUpRequest

class WalletTopUpRequestSerializer(serializers.ModelSerializer):
    """Serializer for wallet top-up requests."""
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = WalletTopUpRequest
        fields = ['id', 'user', 'amount', 'receipt_image', 'status', 'admin_note', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'mobile': obj.user.mobile,
            'full_name': obj.user.full_name,
        }


class WalletTopUpCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating wallet top-up requests."""
    
    class Meta:
        model = WalletTopUpRequest
        fields = ['amount', 'receipt_image']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


# این کلاس را به تهِ فایل serializers.py اضافه کن
class UserSerializer(serializers.ModelSerializer):
    """Serializer for user list in admin panel and profile management."""
    role = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    
    class Meta:
        """Meta configuration for UserSerializer."""
        model = User
        # تمام فیلدهایی که ادمین نیاز دارد ببیند
        fields = [
            'id', 'mobile', 'full_name', 'email', 'avatar', 'birth_date',
            'wallet_balance', 'role', 'is_staff', 'is_superuser', 'is_active', 'date_joined'
        ]
        read_only_fields = ['mobile', 'is_staff', 'is_superuser', 'date_joined']

    def get_role(self, obj):
        """Determine user role based on staff and superuser status."""
        if obj.is_staff or obj.is_superuser:
            return 'ADMIN'
        return 'CUSTOMER'
    
    def get_avatar(self, obj):
        """Return full avatar URL if avatar exists."""
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None