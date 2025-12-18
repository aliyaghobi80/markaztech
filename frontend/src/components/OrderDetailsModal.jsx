// مسیر: src/components/OrderDetailsModal.jsx
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { formatPrice } from "@/lib/utils";
import { 
  X, Package, CreditCard, User, 
  Phone, Receipt, CheckCircle, XCircle, 
  Clock, Truck, Eye, Download, FileText
} from "lucide-react";
import toast from "react-hot-toast";
import { downloadOrderPDF } from "@/lib/pdfGenerator";

export default function OrderDetailsModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get(`/orders/${orderId}/`);
      setOrder(response.data);
    } catch (error) {
      toast.error("خطا در بارگذاری جزئیات سفارش");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: {
        label: "در انتظار پرداخت",
        icon: Clock,
        bgColor: "bg-warning/10",
        textColor: "text-warning",
        borderColor: "border-warning/20"
      },
      PAID: {
        label: "پرداخت شده",
        icon: CheckCircle,
        bgColor: "bg-success/10",
        textColor: "text-success",
        borderColor: "border-success/20"
      },
      CANCELED: {
        label: "لغو شده",
        icon: XCircle,
        bgColor: "bg-error/10",
        textColor: "text-error",
        borderColor: "border-error/20"
      },
      SENT: {
        label: "تحویل داده شده",
        icon: Truck,
        bgColor: "bg-primary/10",
        textColor: "text-primary",
        borderColor: "border-primary/20"
      }
    };
    return configs[status] || configs.PENDING;
  };

  const handleDownloadPDF = async () => {
    try {
      console.log('Starting PDF download for order:', order);
      
      if (!order || !order.id) {
        toast.error("اطلاعات سفارش یافت نشد");
        return;
      }
      
      await downloadOrderPDF(order);
      toast.success("رسید PDF آماده شد");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("خطا در تولید فایل PDF");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <p className="text-foreground-muted">سفارش یافت نشد</p>
          <button onClick={onClose} className="mt-4 btn-primary px-4 py-2 rounded-lg">
            بستن
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* هدر */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">جزئیات سفارش #{order.id}</h2>
              <p className="text-sm text-foreground-muted">
                {new Date(order.created_at).toLocaleDateString('fa-IR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-foreground-muted hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* وضعیت سفارش */}
          <div className="bg-secondary/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}>
                  <StatusIcon className="w-4 h-4" />
                  {statusConfig.label}
                </span>
              </div>
              <div className="text-left">
                <p className="text-2xl font-black text-foreground">{formatPrice(order.total_price)}</p>
                <p className="text-sm text-foreground-muted">مبلغ کل</p>
              </div>
            </div>
          </div>

          {/* اطلاعات مشتری */}
          <div className="bg-secondary/30 rounded-xl p-4">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <User className="w-5 h-5" />
              اطلاعات مشتری
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-foreground-muted" />
                <span className="text-foreground">{order.user?.full_name || "نام نامشخص"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-foreground-muted" />
                <span className="text-foreground dir-ltr">{order.user?.mobile}</span>
              </div>
            </div>
          </div>

          {/* آیتم‌های سفارش */}
          <div>
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Package className="w-5 h-5" />
              محصولات سفارش ({order.items?.length || 0} آیتم)
            </h3>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="bg-secondary/30 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      {item.product?.main_image ? (
                        <img 
                          src={item.product.main_image} 
                          alt={item.product.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{item.product?.title || "محصول حذف شده"}</p>
                      <p className="text-sm text-foreground-muted">تعداد: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-foreground">{formatPrice(item.price)}</p>
                    <p className="text-xs text-foreground-muted">قیمت واحد</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* رسید پرداخت */}
          {order.payment_receipt && (
            <div>
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                رسید پرداخت
              </h3>
              <div className="bg-secondary/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center text-success">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">رسید پرداخت آپلود شده</p>
                    <p className="text-sm text-foreground-muted">برای مشاهده کلیک کنید</p>
                  </div>
                  <a
                    href={order.payment_receipt}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    مشاهده
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* توضیحات ادمین */}
          {order.admin_notes && (
            <div className="bg-success/5 border border-success/20 rounded-xl p-4">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                توضیحات و اطلاعات تحویل
              </h3>
              <div className="bg-background rounded-lg p-3">
                <p className="text-foreground whitespace-pre-wrap">{order.admin_notes}</p>
              </div>
            </div>
          )}

          {/* خلاصه مالی */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              خلاصه مالی
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-foreground-muted">جمع محصولات:</span>
                <span className="font-bold text-foreground">{formatPrice(order.total_price)} تومان</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground-muted">هزینه ارسال:</span>
                <span className="font-bold text-success">رایگان</span>
              </div>
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">مبلغ نهایی:</span>
                  <span className="text-xl font-black text-primary">{formatPrice(order.total_price)} تومان</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* فوتر */}
        <div className="sticky bottom-0 bg-card border-t border-border p-6 rounded-b-2xl">
          <div className="flex gap-3">
            {/* فقط برای سفارشات پرداخت شده امکان دانلود PDF */}
            {order.status === 'PAID' && (
              <button
                onClick={handleDownloadPDF}
                className="flex-1 btn-primary py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                دریافت نسخه چاپی
              </button>
            )}
            <button
              onClick={onClose}
              className={`${order.status === 'PAID' ? 'flex-1' : 'w-full'} btn-secondary py-3 rounded-xl`}
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}