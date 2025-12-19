from rest_framework import serializers
from .models import User, WalletTopUpRequest, Ticket, TicketMessage
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration with mobile number and optional avatar."""
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ['mobile', 'password', 'full_name', 'avatar']

    def create(self, validated_data):
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
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'mobile', 'full_name', 'email', 'avatar', 'wallet_balance', 'role', 'is_staff', 'is_superuser']
        read_only_fields = ['mobile', 'wallet_balance', 'is_staff', 'is_superuser']

    def get_role(self, obj):
        if obj.is_staff or obj.is_superuser:
            return 'ADMIN'
        return 'CUSTOMER'

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer using mobile number instead of username."""
    username_field = 'mobile'

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user_id'] = self.user.id
        data['full_name'] = self.user.full_name
        data['is_admin'] = self.user.is_staff
        return data

class UserSerializer(serializers.ModelSerializer):
    """Serializer for user list in admin panel."""
    role = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'mobile', 'full_name', 'email', 'avatar', 'birth_date',
            'wallet_balance', 'role', 'is_staff', 'is_superuser', 'is_active', 'date_joined'
        ]
        read_only_fields = ['mobile', 'is_staff', 'is_superuser', 'date_joined']

    def get_role(self, obj):
        if obj.is_staff or obj.is_superuser:
            return 'ADMIN'
        return 'CUSTOMER'
    
    def get_avatar(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None

class WalletTopUpRequestSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()
    
    class Meta:
        model = WalletTopUpRequest
        fields = ['id', 'user', 'user_details', 'amount', 'receipt_image', 'status', 'admin_note', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_user_details(self, obj):
        return {
            'id': obj.user.id,
            'mobile': obj.user.mobile,
            'full_name': obj.user.full_name,
            'wallet_balance': obj.user.wallet_balance,
        }

class TicketMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    sender_role = serializers.CharField(source='sender.role', read_only=True)
    is_me = serializers.SerializerMethodField()

    class Meta:
        model = TicketMessage
        fields = ['id', 'ticket', 'sender', 'sender_name', 'sender_role', 'message', 'attachment', 'created_at', 'is_me']
        read_only_fields = ['id', 'sender', 'created_at']

    def get_is_me(self, obj):
        user = self.context['request'].user
        return obj.sender == user

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
