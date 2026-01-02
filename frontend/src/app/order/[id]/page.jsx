// مسیر: src/app/order/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { 
  ArrowRight, Package, CreditCard, User, 
  Phone, Receipt, CheckCircle, XCircle, 
  Clock, Truck, Eye, Download, FileText
} from "lucide-react";
import toast from "react-hot-toast";
import { downloadOrderPDF } from "@/lib/pdfGenerator";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;
  
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
      router.push('/dashboard');
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

  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!order || !order.id) {
      toast.error("اطلاعات سفارش یافت نشد");
      return;
    }
    
    if (order.status !== 'PAID' && order.status !== 'paid') {
      toast.error("فقط سفارشات پرداخت شده قابل دانلود هستند");
      return;
    }
    
    setDownloading(true);
    
    try {
      await downloadOrderPDF(order);
      toast.success("فاکتور با موفقیت دانلود شد");
    } catch (error) {
      toast.error(error.message || "خطا در دریافت فایل PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground-muted mb-4">سفارش یافت نشد</p>
          <button 
            onClick={() => router.push('/dashboard')} 
            className="btn-primary px-4 py-2 rounded-lg"
          >
            بازگشت به داشبورد
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* هدر */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 text-foreground-muted hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">جزئیات سفارش #{order.id}</h1>
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ستون اصلی */}
          <div className="lg:col-span-2 space-y-6">
            {/* وضعیت سفارش */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}>
                    <StatusIcon className="w-4 h-4" />
                    {statusConfig.label}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-3xl font-black text-foreground">{formatPrice(order.total_price)}</p>
                  <p className="text-sm text-foreground-muted">مبلغ کل</p>
                </div>
              </div>
            </div>

            {/* آیتم‌های سفارش */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                محصولات سفارش ({order.items?.length || 0} آیتم)
              </h2>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="bg-secondary/30 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                        {item.product?.main_image ? (
                          <img 
                            src={getImageUrl(item.product.main_image)} 
                            alt={item.product.title}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <Package className={`w-8 h-8 text-primary ${item.product?.main_image ? 'hidden' : 'block'}`} />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{item.product?.title || "محصول حذف شده"}</p>
                        <p className="text-sm text-foreground-muted">تعداد: {item.quantity}</p>
                        <p className="text-xs text-foreground-muted">قیمت واحد: {formatPrice(item.price)} تومان</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-foreground">{formatPrice(item.price * item.quantity)}</p>
                      <p className="text-xs text-foreground-muted">قیمت کل</p>
                      
                      {/* Download button for file products */}
                      {item.product?.product_type === 'file' && (order.status === 'PAID' || order.status === 'paid') && (
                        <button
                          onClick={async () => {
                            try {
                              const response = await api.get(`/products/${item.product.slug}/download/`, {
                                responseType: 'blob'
                              });
                              
                              // Create download link
                              const url = window.URL.createObjectURL(new Blob([response.data]));
                              const link = document.createElement('a');
                              link.href = url;
                              link.setAttribute('download', `${item.product.title}.${item.product.file_type || 'file'}`);
                              document.body.appendChild(link);
                              link.click();
                              link.remove();
                              window.URL.revokeObjectURL(url);
                              
                              toast.success("دانلود شروع شد");
                            } catch (error) {
                              toast.error("خطا در دانلود فایل");
                            }
                          }}
                          className="mt-2 flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          دانلود فایل
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* توضیحات ادمین */}
            {order.admin_notes && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  اطلاعات تحویل و توضیحات
                </h2>
                <div className="bg-success/5 border border-success/20 rounded-xl p-4">
                  <p className="text-foreground whitespace-pre-wrap">{order.admin_notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* ستون کناری */}
          <div className="space-y-6">
            {/* اطلاعات مشتری */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                اطلاعات مشتری
              </h2>
              <div className="space-y-3">
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

            {/* رسید پرداخت */}
            {order.payment_receipt && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  رسید پرداخت
                </h2>
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

            {/* خلاصه مالی */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                خلاصه مالی
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-foreground-muted">جمع محصولات:</span>
                  <span className="font-bold text-foreground">{formatPrice(order.total_price)} تومان</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground-muted">هزینه ارسال:</span>
                  <span className="font-bold text-success">رایگان</span>
                </div>
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground">مبلغ نهایی:</span>
                    <span className="text-xl font-black text-primary">{formatPrice(order.total_price)} تومان</span>
                  </div>
                </div>
              </div>
            </div>

              {/* دکمه دانلود PDF */}
              {(order.status === 'PAID' || order.status === 'paid') && (
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      در حال آماده‌سازی...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      دریافت نسخه چاپی
                    </>
                  )}
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}