// مسیر: src/app/admin/orders/page.jsx
"use client";

import useSWR from "swr";
import api from "@/lib/axios";
import { formatPrice } from "@/lib/utils";
import { CheckCircle, XCircle, Eye, FileText, Download, Zap, Package } from "lucide-react";
import toast from "react-hot-toast";
import { downloadOrderPDF } from "@/lib/pdfGenerator";

const fetcher = (url) => api.get(url).then((res) => res.data);

export default function AdminOrdersPage() {
  const { data: orders, mutate } = useSWR("/orders/", fetcher);

  const handleStatusChange = async (id, newStatus) => {
    try {
        await api.patch(`/orders/${id}/`, { status: newStatus });
        toast.success("وضعیت سفارش تغییر کرد");
        mutate();
    } catch (error) {
        toast.error("خطا در تغییر وضعیت");
    }
  };

    const statusBadge = (status) => {
        const styles = {
            'PENDING': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            'PAID': 'bg-green-500/10 text-green-500 border-green-500/20',
            'CANCELED': 'bg-red-500/10 text-red-500 border-red-500/20',
            'SENT': 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        };
        const labels = {
            'PENDING': 'در انتظار پرداخت',
            'PAID': 'پرداخت شده',
            'CANCELED': 'لغو شده',
            'SENT': 'تحویل داده شده'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    if (!orders) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
      <div className="space-y-8">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                <h1 className="text-2xl font-black text-foreground">مدیریت پرداخت‌ها</h1>
                <p className="text-foreground-muted text-sm mt-1">بررسی و تایید تراکنش‌های کاربران</p>
             </div>
             <div className="flex items-center gap-2 bg-card p-2 rounded-2xl border border-border">
                <div className="px-4 py-2 bg-primary/10 rounded-xl text-primary font-bold text-sm">
                    {orders.length} سفارش کل
                </div>
                <div className="px-4 py-2 bg-yellow-500/10 rounded-xl text-yellow-500 font-bold text-sm">
                    {orders.filter(o => o.status === 'PENDING').length} در انتظار
                </div>
             </div>
         </div>
         
         <div className="grid gap-4">
           {orders.map(order => (
               <div key={order.id} className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden group hover:border-primary/30 transition-all">
                   <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                       
                       <div className="flex items-center gap-4 min-w-[250px]">
                           <div className="w-14 h-14 bg-gradient-to-br from-secondary to-border rounded-2xl flex items-center justify-center font-black text-lg text-foreground shadow-inner">
                               #{order.id}
                           </div>
                           <div>
                               <h3 className="font-bold text-foreground flex items-center gap-2">
                                   {order.user?.full_name || 'کاربر بدون نام'}
                                   {statusBadge(order.status)}
                               </h3>
                               <p className="text-sm text-foreground-muted mt-1">{order.user?.mobile}</p>
                               <p className="text-xs text-foreground-muted/70">{new Date(order.created_at).toLocaleString('fa-IR')}</p>
                           </div>
                       </div>
  
                       <div className="flex flex-col items-center lg:items-start gap-1">
                           <div className="text-xs text-foreground-muted uppercase tracking-wider">مبلغ قابل پرداخت</div>
                           <div className="text-xl font-black text-primary">{formatPrice(order.total_price)} تومان</div>
                       </div>

                       <div className="flex flex-wrap items-center justify-center gap-3">
                           {order.payment_receipt ? (
                               <a 
                                 href={order.payment_receipt} 
                                 target="_blank" 
                                 className="flex items-center gap-2 text-primary hover:bg-primary/20 bg-primary/10 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all"
                               >
                                   <Eye className="w-4 h-4" />
                                   مشاهده فیش
                               </a>
                           ) : (
                               <div className="flex items-center gap-2 text-foreground-muted bg-secondary/50 px-4 py-2.5 rounded-2xl text-sm italic">
                                   <XCircle className="w-4 h-4" />
                                   فیش آپلود نشده
                               </div>
                           )}
                           
                           {order.status === 'PAID' && (
                               <button 
                                   onClick={async (e) => {
                                       const btn = e.currentTarget;
                                       const originalContent = btn.innerHTML;
                                       try {
                                           btn.disabled = true;
                                           btn.innerHTML = '<span class="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>';
                                           await downloadOrderPDF(order);
                                           toast.success("فاکتور آماده دانلود شد");
                                       } catch (err) {
                                           toast.error(err.message);
                                       } finally {
                                           btn.disabled = false;
                                           btn.innerHTML = originalContent;
                                       }
                                   }}
                                   className="flex items-center gap-2 text-green-500 hover:bg-green-500/20 bg-green-500/10 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all disabled:opacity-50"
                               >
                                   <Download className="w-4 h-4" />
                                   فاکتور
                               </button>
                           )}
                       </div>
  
                       <div className="flex items-center gap-2 border-t lg:border-t-0 pt-4 lg:pt-0">
                           {order.status === 'PENDING' ? (
                               <>
                                   <button 
                                       onClick={() => handleStatusChange(order.id, 'PAID')}
                                       className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-2xl font-bold transition-all shadow-lg shadow-green-500/20"
                                   >
                                       <CheckCircle className="w-4 h-4" />
                                       تایید
                                   </button>
                                   
                                   <button 
                                       onClick={() => handleStatusChange(order.id, 'CANCELED')}
                                       className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 px-6 py-2.5 rounded-2xl font-bold transition-all"
                                   >
                                       <XCircle className="w-4 h-4" />
                                       رد
                                   </button>
                               </>
                           ) : (
                               <div className="text-foreground-muted text-sm font-medium px-4 py-2 bg-secondary/30 rounded-xl">
                                   عملیات غیرمجاز
                               </div>
                           )}
                       </div>
                   </div>

                   <div className="px-6 pb-6 pt-0 border-t border-border/50 bg-secondary/10 flex flex-wrap gap-4 items-center">
                        <span className="text-xs text-foreground-muted flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            محصولات:
                        </span>
                        {order.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-card px-3 py-1 rounded-xl border border-border text-xs">
                                <span className="font-bold text-primary">{item.quantity}x</span>
                                <span className="text-foreground-secondary">{item.product?.title}</span>
                            </div>
                        ))}
                   </div>
               </div>
           ))}
         </div>
      </div>
    );
}
