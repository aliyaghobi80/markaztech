# backend/apps/users/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

from .serializers import UserSerializer, UserRegistrationSerializer, CustomTokenObtainPairSerializer


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