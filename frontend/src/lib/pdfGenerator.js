// مسیر: src/lib/pdfGenerator.js
import api from './axios';

// تابع برای دانلود PDF از بک‌اند Django
export const downloadOrderPDF = async (order) => {
  try {
    // بررسی وجود داده‌های سفارش
    if (!order || !order.id) {
      throw new Error('اطلاعات سفارش یافت نشد');
    }

    // بررسی وضعیت پرداخت
    if (order.status !== 'PAID') {
      throw new Error('فقط سفارشات پرداخت شده قابل دانلود هستند');
    }

    // استفاده از نمونه api برای حفظ هدرها و توکن
    const response = await api.get(`/orders/${order.id}/download_pdf/`, {
      responseType: 'blob'
    });

    // ایجاد لینک دانلود
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', `order-${order.id}.pdf`);
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error("PDF Download Error:", error);
    if (error.response && error.response.status === 401) {
      throw new Error('خطای احراز هویت. لطفا دوباره وارد شوید.');
    }
    throw new Error(error.message || 'خطا در دریافت فایل PDF');
  }
};
