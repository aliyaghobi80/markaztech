from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer, Image
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, StyleSheet1
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
from PIL import Image as PILImage
from io import BytesIO
import arabic_reshaper
from bidi.algorithm import get_display
import sys

FONTS_DIR = Path(__file__).resolve().parent.parent.parent / 'assets' / 'fonts'

_fonts_registered = False

def register_persian_fonts():
    global _fonts_registered
    if _fonts_registered:
        return True
    try:
        regular_font_path = FONTS_DIR / 'Vazirmatn-Regular.ttf'
        bold_font_path = FONTS_DIR / 'Vazirmatn-Bold.ttf'
        
        if not regular_font_path.exists():
            return False
            
        if not bold_font_path.exists():
            return False
        
        pdfmetrics.registerFont(
            TTFont('Vazir', str(regular_font_path))
        )
        pdfmetrics.registerFont(
            TTFont('Vazir-Bold', str(bold_font_path))
        )
        
        _fonts_registered = True
        return True
    except Exception as e:
        return False

def persian_text(text):
    """Convert Persian/Arabic text to proper display form for PDF"""
    if not text:
        return ""
    text = str(text)
    
    if text.isascii():
        return text
    
    try:
        reshaped = arabic_reshaper.reshape(text)
        bidi_text = get_display(reshaped)
        return bidi_text
    except Exception:
        return text

def format_persian_number(num):
    """Convert number to Persian digits"""
    if num is None:
        return persian_text("۰")
    
    persian_digits = '۰۱۲۳۴۵۶۷۸۹'
    english_digits = '0123456789'
    
    num_str = str(int(num))
    result = ""
    for char in num_str:
        if char in english_digits:
            result += persian_digits[int(char)]
        else:
            result += char
    
    return result

def format_persian_price(price):
    """Format price with Persian digits and thousand separators"""
    if not price:
        return format_persian_number(0)
    
    persian_digits = '۰۱۲۳۴۵۶۷۸۹'
    english_digits = '0123456789'
    
    formatted_price = f"{int(price):,}"
    
    result = ""
    for char in formatted_price:
        if char in english_digits:
            result += persian_digits[int(char)]
        else:
            result += char
    
    return result

def get_product_image(product):
    try:
        if product and product.main_image:
            image_path = os.path.join(settings.MEDIA_ROOT, str(product.main_image))
            
            if os.path.exists(image_path):
                img = PILImage.open(image_path)
                img = img.resize((40, 40), PILImage.Resampling.LANCZOS)
                
                img_buffer = BytesIO()
                img.save(img_buffer, format='PNG')
                img_buffer.seek(0)
                
                return Image(img_buffer, width=1*cm, height=1*cm)
    except Exception as e:
        pass
    
    return None

def generate_order_pdf(order):
    if not register_persian_fonts():
        raise Exception("خطا در بارگذاری فونت‌های فارسی")
    

    
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="order-{order.id}.pdf"'
    
    doc = SimpleDocTemplate(
        response,
        pagesize=A4,
        rightMargin=1.5*cm,
        leftMargin=1.5*cm,
        topMargin=1.5*cm,
        bottomMargin=1.5*cm
    )
    
    styles = StyleSheet1()
    
    styles.add(ParagraphStyle(
        name='RTL',
        fontName='Vazir',
        alignment=TA_LEFT,
        fontSize=10,
        leading=16,
        spaceAfter=4,
        rightIndent=0,
        leftIndent=0
    ))
    
    styles.add(ParagraphStyle(
        name='RTL-Bold',
        fontName='Vazir-Bold',
        alignment=TA_LEFT,
        fontSize=11,
        leading=16,
        spaceAfter=6
    ))
    
    styles.add(ParagraphStyle(
        name='Center',
        fontName='Vazir-Bold',
        alignment=TA_CENTER,
        fontSize=14,
        leading=18,
        spaceAfter=8
    ))
    
    styles.add(ParagraphStyle(
        name='MainTitle',
        fontName='Vazir-Bold',
        alignment=TA_CENTER,
        fontSize=22,
        leading=28,
        spaceAfter=12,
        textColor=colors.HexColor('#1e40af')
    ))
    
    styles.add(ParagraphStyle(
        name='SubTitle',
        fontName='Vazir',
        alignment=TA_CENTER,
        fontSize=11,
        leading=14,
        spaceAfter=4,
        textColor=colors.HexColor('#64748b')
    ))
    
    elements = []
    
    header_data = [[
        Paragraph(persian_text('مرکز تک'), styles['MainTitle'])
    ]]
    header_table = Table(header_data, colWidths=[18*cm])
    header_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(header_table)
    
    elements.append(Paragraph(persian_text('فروشگاه اکانت‌های پریمیوم هوش مصنوعی'), styles['SubTitle']))
    elements.append(Spacer(1, 0.3*cm))
    
    line_data = [['']]
    line_table = Table(line_data, colWidths=[18*cm], rowHeights=[3])
    line_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#3b82f6')),
    ]))
    elements.append(line_table)
    elements.append(Spacer(1, 0.4*cm))
    
    elements.append(Paragraph(persian_text('فاکتور سفارش'), styles['Center']))
    elements.append(Spacer(1, 0.3*cm))
    
    try:
        shamsi_date = jdatetime.date.fromgregorian(
            date=order.created_at.date()
        ).strftime('%Y/%m/%d')
    except:
        shamsi_date = order.created_at.strftime('%Y/%m/%d')
    
    status_display = "پرداخت شده" if order.status == "PAID" else "در انتظار پرداخت"
    status_color = colors.HexColor('#059669') if order.status == "PAID" else colors.HexColor('#dc2626')
    
    customer_name = order.user.full_name if order.user and order.user.full_name else "نامشخص"
    customer_mobile = order.user.mobile if order.user and order.user.mobile else "نامشخص"
    
    info_data = [
        [
            shamsi_date,
            persian_text('تاریخ:'),
            f'#{order.id}',
            persian_text('شماره سفارش:')
        ],
        [
            customer_mobile,
            persian_text('شماره تماس:'),
            persian_text(customer_name),
            persian_text('نام مشتری:')
        ],
    ]
    
    info_table = Table(info_data, colWidths=[5*cm, 3.5*cm, 5*cm, 4.5*cm])
    info_table.setStyle(TableStyle([
        ('FONT', (0,0), (-1,-1), 'Vazir'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#e2e8f0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('FONTNAME', (1,0), (1,-1), 'Vazir-Bold'),
        ('FONTNAME', (3,0), (3,-1), 'Vazir-Bold'),
        ('TEXTCOLOR', (1,0), (1,-1), colors.HexColor('#475569')),
        ('TEXTCOLOR', (3,0), (3,-1), colors.HexColor('#475569')),
    ]))
    
    elements.append(info_table)
    elements.append(Spacer(1, 0.3*cm))
    
    status_data = [[
        persian_text(status_display),
        persian_text('وضعیت سفارش:')
    ]]
    status_table = Table(status_data, colWidths=[12*cm, 6*cm])
    status_table.setStyle(TableStyle([
        ('FONT', (0,0), (-1,-1), 'Vazir-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 11),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f0fdf4') if order.status == "PAID" else colors.HexColor('#fef2f2')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#86efac') if order.status == "PAID" else colors.HexColor('#fca5a5')),
        ('ALIGN', (0,0), (0,0), 'CENTER'),
        ('ALIGN', (1,0), (1,0), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TEXTCOLOR', (0,0), (0,0), status_color),
    ]))
    elements.append(status_table)
    elements.append(Spacer(1, 0.4*cm))
    
    section_title_data = [[persian_text('اقلام سفارش')]]
    section_table = Table(section_title_data, colWidths=[18*cm])
    section_table.setStyle(TableStyle([
        ('FONT', (0,0), (-1,-1), 'Vazir-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 12),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(section_table)
    
    products_data = [
        [
            persian_text('جمع کل'),
            persian_text('قیمت واحد'),
            persian_text('تعداد'),
            persian_text('نام محصول'),
            persian_text('ردیف')
        ]
    ]
    
    total_amount = 0
    row_num = 1
    if order.items.exists():
        for item in order.items.all():
            item_total = item.price * item.quantity
            total_amount += item_total
            
            product_title = item.product.title if item.product else 'محصول حذف شده'
            
            products_data.append([
                format_persian_price(item_total) + ' ' + persian_text('تومان'),
                format_persian_price(item.price) + ' ' + persian_text('تومان'),
                format_persian_number(item.quantity),
                persian_text(product_title),
                format_persian_number(row_num)
            ])
            row_num += 1
    else:
        products_data.append([
            '',
            '',
            '',
            persian_text('هیچ محصولی یافت نشد'),
            format_persian_number(1)
        ])
    
    products_table = Table(products_data, colWidths=[4*cm, 4*cm, 2*cm, 6*cm, 2*cm])
    products_table.setStyle(TableStyle([
        ('FONT', (0,0), (-1,-1), 'Vazir'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('FONTNAME', (0,0), (-1,0), 'Vazir-Bold'),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#3b82f6')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#f8fafc'), colors.white]),
    ]))
    
    elements.append(products_table)
    elements.append(Spacer(1, 0.3*cm))
    
    total_data = [
        [
            format_persian_price(order.total_price) + ' ' + persian_text('تومان'),
            persian_text('مبلغ کل سفارش')
        ]
    ]
    
    total_table = Table(total_data, colWidths=[10*cm, 8*cm])
    total_table.setStyle(TableStyle([
        ('FONT', (0,0), (-1,-1), 'Vazir-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 14),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.white),
        ('BOX', (0,0), (-1,-1), 2, colors.HexColor('#1e3a8a')),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
    ]))
    
    elements.append(total_table)
    elements.append(Spacer(1, 0.4*cm))
    
    if order.admin_notes:
        notes_title_data = [[persian_text('اطلاعات تحویل و توضیحات')]]
        notes_title_table = Table(notes_title_data, colWidths=[18*cm])
        notes_title_table.setStyle(TableStyle([
            ('FONT', (0,0), (-1,-1), 'Vazir-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 11),
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#059669')),
            ('TEXTCOLOR', (0,0), (-1,-1), colors.white),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ]))
        elements.append(notes_title_table)
        
        notes_data = [[persian_text(order.admin_notes)]]
        notes_table = Table(notes_data, colWidths=[18*cm])
        notes_table.setStyle(TableStyle([
            ('FONT', (0,0), (-1,-1), 'Vazir'),
            ('FONTSIZE', (0,0), (-1,-1), 10),
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#ecfdf5')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#86efac')),
            ('ALIGN', (0,0), (-1,-1), 'RIGHT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('LEFTPADDING', (0,0), (-1,-1), 12),
            ('RIGHTPADDING', (0,0), (-1,-1), 12),
            ('TOPPADDING', (0,0), (-1,-1), 12),
            ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ]))
        
        elements.append(notes_table)
        elements.append(Spacer(1, 0.4*cm))
    
    elements.append(Spacer(1, 0.8*cm))
    
    footer_line_data = [['']]
    footer_line_table = Table(footer_line_data, colWidths=[18*cm], rowHeights=[2])
    footer_line_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#e2e8f0')),
    ]))
    elements.append(footer_line_table)
    elements.append(Spacer(1, 0.3*cm))
    
    elements.append(Paragraph(persian_text('با تشکر از خرید شما'), styles['Center']))
    elements.append(Paragraph(persian_text('مرکز تک - فروشگاه اکانت‌های پریمیوم هوش مصنوعی'), styles['SubTitle']))
    elements.append(Paragraph('support@markaztech.com', styles['SubTitle']))
    
    doc.build(elements)
    
    return response
