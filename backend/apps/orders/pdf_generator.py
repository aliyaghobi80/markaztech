# مسیر: backend/apps/orders/pdf_generator.py
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer, Image
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_RIGHT, TA_CENTER, TA_LEFT
from reportlab.lib import colors
from reportlab.lib.units import cm
import jdatetime
from django.http import HttpResponse
from django.conf import settings
from pathlib import Path
import os
import requests
from PIL import Image as PILImage
from io import BytesIO

# مسیر فونت‌ها
FONTS_DIR = Path(__file__).resolve().parent.parent.parent / 'assets' / 'fonts'

def register_persian_fonts():
    """ثبت فونت‌های فارسی"""
    try:
        # ثبت فونت‌های فارسی
        pdfmetrics.registerFont(
            TTFont('Vazir', str(FONTS_DIR / 'Vazirmatn-Regular.ttf'))
        )
        pdfmetrics.registerFont(
            TTFont('Vazir-Bold', str(FONTS_DIR / 'Vazirmatn-Bold.ttf'))
        )
        return True
    except Exception as e:
        print(f"Error registering fonts: {e}")
        return False

def format_persian_price(price):
    """فرمت کردن قیمت به فارسی"""
    if not price:
        return "0"
    
    # تبدیل اعداد انگلیسی به فارسی
    persian_digits = '۰۱۲۳۴۵۶۷۸۹'
    english_digits = '0123456789'
    
    formatted_price = f"{int(price):,}"
    
    # تبدیل اعداد انگلیسی به فارسی
    for i, digit in enumerate(english_digits):
        formatted_price = formatted_price.replace(digit, persian_digits[i])
    
    return formatted_price

def get_product_image(product):
    """دریافت تصویر محصول برای PDF"""
    try:
        if product and product.main_image:
            # ساخت مسیر کامل تصویر
            image_path = os.path.join(settings.MEDIA_ROOT, str(product.main_image))
            
            if os.path.exists(image_path):
                # بررسی و تغییر اندازه تصویر
                img = PILImage.open(image_path)
                
                # تغییر اندازه به 40x40 پیکسل
                img = img.resize((40, 40), PILImage.Resampling.LANCZOS)
                
                # ذخیره در حافظه
                img_buffer = BytesIO()
                img.save(img_buffer, format='PNG')
                img_buffer.seek(0)
                
                # ایجاد Image object برای reportlab
                return Image(img_buffer, width=1*cm, height=1*cm)
    except Exception as e:
        print(f"Error processing product image: {e}")
    
    return None

def generate_order_pdf(order):
    """تولید PDF فارسی برای سفارش"""
    
    # ثبت فونت‌ها
    if not register_persian_fonts():
        raise Exception("خطا در بارگذاری فونت‌های فارسی")
    
    # ایجاد response
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="order-{order.id}.pdf"'
    
    # ایجاد PDF
    doc = SimpleDocTemplate(
        response,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    
    # تعریف استایل‌ها - استفاده از StyleSheet1 به جای getSampleStyleSheet برای جلوگیری از تداخل
    from reportlab.lib.styles import StyleSheet1
    styles = StyleSheet1()
    
    # استایل راست‌چین
    styles.add(ParagraphStyle(
        name='RTL',
        fontName='Vazir',
        alignment=TA_RIGHT,
        fontSize=11,
        leading=16,
        spaceAfter=6
    ))
    
    # استایل راست‌چین پررنگ
    styles.add(ParagraphStyle(
        name='RTL-Bold',
        fontName='Vazir-Bold',
        alignment=TA_RIGHT,
        fontSize=12,
        leading=16,
        spaceAfter=8
    ))
    
    # استایل وسط‌چین
    styles.add(ParagraphStyle(
        name='Center',
        fontName='Vazir-Bold',
        alignment=TA_CENTER,
        fontSize=16,
        leading=20,
        spaceAfter=12
    ))
    
    # استایل عنوان اصلی
    styles.add(ParagraphStyle(
        name='MainTitle',
        fontName='Vazir-Bold',
        alignment=TA_CENTER,
        fontSize=20,
        leading=24,
        spaceAfter=20,
        textColor=colors.HexColor('#3b82f6')
    ))
    
    # لیست عناصر PDF
    elements = []
    
    # هدر
    elements.append(Paragraph('مرکز تک', styles['MainTitle']))
    elements.append(Paragraph('فروشگاه اکانت‌های پریمیوم هوش مصنوعی', styles['Center']))
    elements.append(Spacer(1, 0.5*cm))
    
    # عنوان رسید
    elements.append(Paragraph('رسید سفارش', styles['MainTitle']))
    elements.append(Spacer(1, 0.3*cm))
    
    # تبدیل تاریخ به شمسی
    try:
        shamsi_date = jdatetime.date.fromgregorian(
            date=order.created_at.date()
        ).strftime('%Y/%m/%d')
    except:
        shamsi_date = order.created_at.strftime('%Y/%m/%d')
    
    # اطلاعات سفارش
    info_data = [
        ['اطلاعات سفارش', ''],
        [f'شماره سفارش: #{order.id}', ''],
        [f'تاریخ سفارش: {shamsi_date}', ''],
        [f'نام مشتری: {order.user.full_name if order.user else "نامشخص"}', ''],
        [f'شماره موبایل: {order.user.mobile if order.user else "نامشخص"}', ''],
        [f'وضعیت: {"پرداخت شده" if order.status == "PAID" else "در انتظار پرداخت"}', '']
    ]
    
    info_table = Table(info_data, colWidths=[10*cm, 8*cm])
    info_table.setStyle(TableStyle([
        ('FONT', (0,0), (-1,-1), 'Vazir'),
        ('FONTSIZE', (0,0), (-1,-1), 11),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f3f4f6')),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#f8fafc')),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#e5e7eb')),
        ('ALIGN', (0,0), (-1,-1), 'RIGHT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('SPAN', (0,1), (1,1)),  # ادغام سلول‌های شماره سفارش
        ('SPAN', (0,2), (1,2)),  # ادغام سلول‌های تاریخ
        ('SPAN', (0,3), (1,3)),  # ادغام سلول‌های نام
        ('SPAN', (0,4), (1,4)),  # ادغام سلول‌های موبایل
        ('SPAN', (0,5), (1,5)),  # ادغام سلول‌های وضعیت
    ]))
    
    elements.append(info_table)
    elements.append(Spacer(1, 0.5*cm))
    
    # جدول محصولات
    elements.append(Paragraph('اقلام سفارش', styles['RTL-Bold']))
    elements.append(Spacer(1, 0.2*cm))
    
    # هدر جدول محصولات
    products_data = [
        ['جمع کل', 'قیمت واحد', 'تعداد', 'نام محصول', 'تصویر']
    ]
    
    # اضافه کردن محصولات
    total_amount = 0
    if order.items.exists():
        for item in order.items.all():
            item_total = item.price * item.quantity
            total_amount += item_total
            
            # دریافت تصویر محصول
            product_image = get_product_image(item.product)
            
            products_data.append([
                f'{format_persian_price(item_total)} تومان',
                f'{format_persian_price(item.price)} تومان',
                format_persian_price(item.quantity),
                item.product.title if item.product else 'محصول حذف شده',
                product_image if product_image else 'بدون تصویر'
            ])
    else:
        products_data.append(['', '', '', 'هیچ محصولی یافت نشد', ''])
    
    products_table = Table(products_data, colWidths=[3.5*cm, 3.5*cm, 2.5*cm, 6*cm, 2.5*cm])
    products_table.setStyle(TableStyle([
        ('FONT', (0,0), (-1,-1), 'Vazir'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#3b82f6')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#f8fafc')),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#e5e7eb')),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('FONTNAME', (0,0), (-1,0), 'Vazir-Bold'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#f8fafc'), colors.white]),
    ]))
    
    elements.append(products_table)
    elements.append(Spacer(1, 0.3*cm))
    
    # مجموع کل
    total_data = [
        ['مبلغ کل سفارش', f'{format_persian_price(order.total_price)} تومان']
    ]
    
    total_table = Table(total_data, colWidths=[9*cm, 9*cm])
    total_table.setStyle(TableStyle([
        ('FONT', (0,0), (-1,-1), 'Vazir-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 14),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#3b82f6')),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.whitesmoke),
        ('GRID', (0,0), (-1,-1), 2, colors.HexColor('#1d4ed8')),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    
    elements.append(total_table)
    elements.append(Spacer(1, 0.5*cm))
    
    # توضیحات ادمین
    if order.admin_notes:
        elements.append(Paragraph('اطلاعات تحویل و توضیحات', styles['RTL-Bold']))
        elements.append(Spacer(1, 0.2*cm))
        
        # جدول توضیحات
        notes_data = [[order.admin_notes]]
        notes_table = Table(notes_data, colWidths=[18*cm])
        notes_table.setStyle(TableStyle([
            ('FONT', (0,0), (-1,-1), 'Vazir'),
            ('FONTSIZE', (0,0), (-1,-1), 11),
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#ecfdf5')),
            ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#10b981')),
            ('ALIGN', (0,0), (-1,-1), 'RIGHT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('LEFTPADDING', (0,0), (-1,-1), 12),
            ('RIGHTPADDING', (0,0), (-1,-1), 12),
            ('TOPPADDING', (0,0), (-1,-1), 12),
            ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ]))
        
        elements.append(notes_table)
        elements.append(Spacer(1, 0.5*cm))
    
    # فوتر
    elements.append(Spacer(1, 1*cm))
    elements.append(Paragraph('با تشکر از خرید شما', styles['Center']))
    elements.append(Paragraph('مرکز تک - فروشگاه اکانت‌های پریمیوم هوش مصنوعی', styles['RTL']))
    
    # ساخت PDF
    doc.build(elements)
    
    return response