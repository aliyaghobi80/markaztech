# مسیر: backend/apps/articles/upload_views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import default_storage
from django.conf import settings
from django.http import JsonResponse
import os
import uuid
import mimetypes

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_file(request):
    """
    آپلود فایل برای ویرایشگر متن (TinyMCE و RichTextEditor)
    """
    if 'file' not in request.FILES:
        return Response({'error': 'فایل ارسال نشده است'}, status=status.HTTP_400_BAD_REQUEST)
    
    file = request.FILES['file']
    
    # بررسی نوع فایل
    allowed_types = ['image/', 'video/', 'audio/', 'application/pdf']
    if not any(file.content_type.startswith(t) for t in allowed_types):
        return Response({'error': 'نوع فایل مجاز نیست'}, status=status.HTTP_400_BAD_REQUEST)
    
    # بررسی سایز فایل (حداکثر 100MB)
    if file.size > 100 * 1024 * 1024:
        return Response({'error': 'سایز فایل بیش از حد مجاز است (حداکثر 100 مگابایت)'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # ایجاد نام یکتا برای فایل
        file_extension = os.path.splitext(file.name)[1]
        unique_filename = f"{uuid.uuid4().hex}{file_extension}"
        
        # تعیین مسیر ذخیره بر اساس نوع فایل
        if file.content_type.startswith('image/'):
            upload_path = f"editor/images/{unique_filename}"
        elif file.content_type.startswith('video/'):
            upload_path = f"editor/videos/{unique_filename}"
        elif file.content_type.startswith('audio/'):
            upload_path = f"editor/audio/{unique_filename}"
        else:
            upload_path = f"editor/files/{unique_filename}"
        
        # ذخیره فایل
        file_path = default_storage.save(upload_path, file)
        
        # ایجاد URL کامل
        file_url = request.build_absolute_uri(settings.MEDIA_URL + file_path)
        
        # پاسخ مناسب برای TinyMCE
        response_data = {
            'location': file_url,  # TinyMCE انتظار این فیلد را دارد
            'url': file_url,
            'filename': file.name,
            'size': file.size,
            'type': file.content_type
        }
        
        return JsonResponse(response_data, status=201)
        
    except Exception as e:
        return Response({'error': 'خطا در ذخیره فایل'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)