// مسیر: src/lib/pdfGenerator.js
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";

// تابع برای دانلود PDF از بک‌اند Django
export const downloadOrderPDF = async (order) => {
  // بررسی وجود داده‌های سفارش
  if (!order || !order.id) {
    throw new Error('اطلاعات سفارش یافت نشد');
  }

  // بررسی وضعیت پرداخت
  if (order.status !== 'PAID') {
    throw new Error('فقط سفارشات پرداخت شده قابل دانلود هستند');
  }

  // گرفتن توکن از localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  try {
    const response = await axios({
      method: 'GET',
      url: `${API_BASE_URL}/orders/${order.id}/download_pdf/`,
      responseType: 'blob',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      timeout: 60000,
    });

    // بررسی نوع پاسخ
    const contentType = response.headers['content-type'];
    
    // اگر پاسخ JSON است (احتمالاً خطا)
    if (contentType && contentType.includes('application/json')) {
      const text = await response.data.text();
      const errorData = JSON.parse(text);
      throw new Error(errorData.error || errorData.detail || 'خطا در دریافت فایل PDF');
    }

    // ایجاد لینک دانلود
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', `invoice-${order.id}.pdf`);
    
    document.body.appendChild(link);
    link.click();
    
    // پاکسازی بعد از دانلود
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      window.URL.revokeObjectURL(url);
    }, 500);
    
    return true;
  } catch (error) {
    // تلاش برای استخراج پیام خطا از Blob در صورت وجود
    if (error.response && error.response.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.error || errorData.detail || 'خطا در دریافت فایل PDF');
      } catch {
        // اگر پارس کردن متن شکست خورد، ادامه می‌دهیم با خطای اصلی
      }
    }

    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('خطای احراز هویت. لطفا دوباره وارد شوید.');
      }
      if (error.response.status === 404) {
        throw new Error('سفارش یافت نشد');
      }
      if (error.response.status === 500) {
        throw new Error('خطای سرور در تولید فاکتور');
      }
    }

    if (error.code === 'ECONNABORTED') {
      throw new Error('زمان درخواست به پایان رسید. لطفا دوباره تلاش کنید.');
    }

    throw new Error(error.message || 'خطا در دریافت فایل PDF');
  }
};
