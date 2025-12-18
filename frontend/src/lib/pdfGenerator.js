// مسیر: src/lib/pdfGenerator.js
import jsPDF from 'jspdf';
import { formatPrice } from './utils';
import api from './axios';

// تابع برای دانلود PDF از بک‌اند Django
export const downloadOrderPDF = async (order) => {
  console.log('PDF download started for order:', order);
  
  try {
    // بررسی وجود داده‌های سفارش
    if (!order || !order.id) {
      throw new Error('اطلاعات سفارش یافت نشد');
    }

    // بررسی وضعیت پرداخت
    if (order.status !== 'PAID') {
      throw new Error('فقط سفارشات پرداخت شده قابل دانلود هستند');
    }

    console.log('Requesting PDF from backend using api instance...');
    
    // استفاده از نمونه api برای حفظ هدرها و توکن
    const response = await api.get(`/orders/${order.id}/download_pdf/`, {
      responseType: 'blob'
    });

    console.log('PDF received, starting download...');

    // ایجاد لینک دانلود
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `order-${order.id}.pdf`;
    
    // اضافه کردن به DOM و کلیک کردن
    document.body.appendChild(link);
    link.click();
    
    // پاک کردن
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('PDF download completed successfully');
    
  } catch (error) {
    console.error('Error downloading PDF:', error);
    
    // Fallback: باز کردن صفحه چاپ فارسی
    try {
      console.log('Using fallback print method...');
      const printContent = createPrintableReceipt(order);
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Wait for content to load, then show print dialog once
        printWindow.onload = function() {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
        
        printWindow.focus();
      } else {
        throw new Error('Could not open print window');
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      throw new Error(error.message || 'خطا در دانلود PDF');
    }
  }
};

// تابع کمکی برای ایجاد محتوای قابل چاپ با فونت فارسی
const createPrintableReceipt = (order) => {
  console.log('Creating printable receipt for order:', order);
  
  if (!order || !order.id) {
    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><title>خطا</title></head>
      <body><h1>خطا: اطلاعات سفارش یافت نشد</h1></body>
      </html>
    `;
  }
  
  const orderDate = new Date(order.created_at).toLocaleDateString('fa-IR');
  
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
      <meta charset="UTF-8">
      <title>رسید سفارش #${order.id}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Vazirmatn', 'Tahoma', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: white;
        }
        
        .header {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 12px;
          margin-bottom: 30px;
        }
        
        .header h1 {
          font-size: 28px;
          margin: 0 0 8px 0;
          font-weight: 700;
        }
        
        .header p {
          font-size: 16px;
          margin: 0;
        }
        
        h2, h3 {
          color: #1f2937;
          margin: 20px 0 15px 0;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin: 20px 0;
        }
        
        .info-item {
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          border-right: 4px solid #3b82f6;
        }
        
        .info-label {
          font-weight: 600;
          margin-bottom: 5px;
          color: #374151;
        }
        
        .info-value {
          color: #1f2937;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          border: 1px solid #e5e7eb;
        }
        
        th, td {
          padding: 12px;
          text-align: right;
          border-bottom: 1px solid #e5e7eb;
        }
        
        th {
          background: #f3f4f6;
          font-weight: 600;
          color: #374151;
        }
        
        .total-section {
          background: #3b82f6;
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin: 20px 0;
        }
        
        .total-section h3 {
          color: white;
          margin: 0 0 10px 0;
        }
        
        .admin-notes {
          background: #ecfdf5;
          border: 1px solid #10b981;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        
        .admin-notes h3 {
          color: #065f46;
          margin: 0 0 10px 0;
        }
        
        .admin-notes p {
          color: #047857;
          margin: 0;
        }
        
        .footer {
          text-align: center;
          margin-top: 30px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        
        @media print {
          body { 
            padding: 0; 
            max-width: none;
          }
          .header { 
            break-inside: avoid; 
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          .total-section {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>مرکز تک</h1>
        <p>فروشگاه اکانت‌های پریمیوم هوش مصنوعی</p>
      </div>
      
      <h2>رسید سفارش</h2>
      
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">شماره سفارش</div>
          <div class="info-value">#${order.id}</div>
        </div>
        <div class="info-item">
          <div class="info-label">تاریخ سفارش</div>
          <div class="info-value">${orderDate}</div>
        </div>
        <div class="info-item">
          <div class="info-label">نام مشتری</div>
          <div class="info-value">${order.user?.full_name || 'نامشخص'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">شماره موبایل</div>
          <div class="info-value">${order.user?.mobile || 'نامشخص'}</div>
        </div>
      </div>
      
      <h3>اقلام سفارش</h3>
      <table>
        <thead>
          <tr>
            <th>محصول</th>
            <th>تعداد</th>
            <th>قیمت واحد</th>
            <th>قیمت کل</th>
          </tr>
        </thead>
        <tbody>
          ${order.items && order.items.length > 0 ? 
            order.items.map(item => `
              <tr>
                <td>${item.product?.title || 'محصول حذف شده'}</td>
                <td>${item.quantity}</td>
                <td>${formatPrice(item.price)} تومان</td>
                <td>${formatPrice(item.price * item.quantity)} تومان</td>
              </tr>
            `).join('') : 
            '<tr><td colspan="4" style="text-align: center;">هیچ محصولی یافت نشد</td></tr>'
          }
        </tbody>
      </table>
      
      <div class="total-section">
        <h3>مبلغ کل سفارش</h3>
        <div style="font-size: 24px; font-weight: 700;">${formatPrice(order.total_price)} تومان</div>
      </div>
      
      ${order.admin_notes ? `
        <div class="admin-notes">
          <h3>اطلاعات تحویل و توضیحات</h3>
          <p style="white-space: pre-wrap;">${order.admin_notes}</p>
        </div>
      ` : ''}
      
      <div class="footer">
        <p><strong>با تشکر از خرید شما</strong></p>
        <p>مرکز تک - فروشگاه اکانت‌های پریمیوم هوش مصنوعی</p>
      </div>
      

    </body>
    </html>
  `;
};