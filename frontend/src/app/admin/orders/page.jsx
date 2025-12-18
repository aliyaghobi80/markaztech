// مسیر: src/app/admin/orders/page.jsx
"use client";

import useSWR from "swr";
import api from "@/lib/axios";
import { formatPrice } from "@/lib/utils";
import { CheckCircle, XCircle, Eye, FileText, Download } from "lucide-react";
import toast from "react-hot-toast";
import { downloadOrderPDF } from "@/lib/pdfGenerator";

const fetcher = (url) => api.get(url).then((res) => res.data);

export default function AdminOrdersPage() {
  // نکته: باید در بک‌اند یک ViewSet بسازیم که تمام سفارش‌ها را به ادمین بدهد
  // فعلا از همان اندپوینت قبلی استفاده میکنیم (فرض بر اینکه بک‌اند را اصلاح خواهیم کرد)
  const { data: orders, mutate } = useSWR("/orders/all_orders/", fetcher);

  const handleStatusChange = async (id, newStatus) => {
    try {
        await api.patch(`/orders/${id}/`, { status: newStatus });
        toast.success("وضعیت سفارش تغییر کرد");
        mutate(); // آپلود لیست
    } catch (error) {
        toast.error("خطا در تغییر وضعیت");
    }
  };

  if (!orders) return <div>در حال بارگذاری سفارشات...</div>;

  return (
    <div>
       <h1 className="text-2xl font-black text-foreground mb-8">مدیریت پرداخت‌ها</h1>
       
       <div className="grid gap-6">
         {orders.map(order => (
             <div key={order.id} className="bg-card p-6 rounded-3xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                 
                 {/* اطلاعات خریدار */}
                 <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center font-bold text-secondary-foreground">
                         ID
                     </div>
                     <div>
                         <h3 className="font-bold text-foreground">سفارش #{order.id}</h3>
                         <p className="text-sm text-foreground-muted">{order.created_at}</p>
                         <p className="text-primary font-bold mt-1">{formatPrice(order.total_price)} تومان</p>
                     </div>
                 </div>

                   {/* نمایش فیش و دانلود PDF */}
                   <div className="flex-1 flex flex-col items-center gap-2">
                       {order.payment_receipt ? (
                           <a href={order.payment_receipt} target="_blank" className="flex items-center gap-2 text-primary hover:underline bg-primary/10 px-4 py-2 rounded-xl text-sm w-full justify-center">
                               <FileText className="w-4 h-4" />
                               مشاهده تصویر فیش
                           </a>
                       ) : (
                           <span className="text-foreground-muted text-sm italic">فیش آپلود نشده</span>
                       )}
                       
                       {order.status === 'PAID' && (
                           <button 
                               onClick={() => downloadOrderPDF(order).catch(err => toast.error(err.message))}
                               className="flex items-center gap-2 text-success hover:underline bg-success/10 px-4 py-2 rounded-xl text-sm w-full justify-center"
                           >
                               <Download className="w-4 h-4" />
                               نسخه چاپی (PDF)
                           </button>
                       )}
                   </div>

                 {/* دکمه‌های تایید/رد */}
                 <div className="flex items-center gap-2">
                     <button 
                        onClick={() => handleStatusChange(order.id, 'PAID')}
                        className="flex items-center gap-2 bg-success hover:bg-success/90 text-success-foreground px-4 py-2 rounded-xl transition-colors"
                     >
                         <CheckCircle className="w-4 h-4" />
                         تایید پرداخت
                     </button>
                     
                     <button 
                        onClick={() => handleStatusChange(order.id, 'CANCELED')}
                        className="flex items-center gap-2 bg-error/10 hover:bg-error/20 text-error px-4 py-2 rounded-xl transition-colors"
                     >
                         <XCircle className="w-4 h-4" />
                         رد کردن
                     </button>
                 </div>
             </div>
         ))}
       </div>
    </div>
  );
}