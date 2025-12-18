// مسیر: src/app/checkout/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { formatPrice } from "@/lib/utils";
import { CreditCard, UploadCloud, CheckCircle2, Copy, Wallet, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { loading: authLoading } = useAuth();
  const { clearCart } = useCart();

  useEffect(() => {
    if (authLoading) return;
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}/`);
        setOrder(response.data);
      } catch (error) {
        console.error(error);
        toast.error("سفارش یافت نشد");
        router.push("/dashboard"); // ریدایرکت در صورت خطا
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id, router]);

  const handleUpload = async () => {
    if (!file) {
      toast.error("لطفا تصویر فیش را انتخاب کنید");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم فایل نباید بیشتر از 5 مگابایت باشد");
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("فقط فایل‌های تصویری (JPG, PNG) مجاز هستند");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("payment_receipt", file);

    try {
      const response = await api.post(`/orders/${id}/upload_receipt/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      console.log("Upload response:", response.data);
      toast.success("فیش پرداخت با موفقیت ثبت شد!");
      
      // پاک کردن سبد خرید بعد از پرداخت موفق
      clearCart();
      
      setTimeout(() => router.push("/dashboard"), 2000);
      
    } catch (error) {
      console.error("Upload error:", error);
      
      if (error.response?.data) {
        console.error("Server error details:", error.response.data);
        
        // Handle specific validation errors
        if (error.response.data.payment_receipt) {
          toast.error(error.response.data.payment_receipt[0]);
        } else if (error.response.data.error) {
          toast.error(error.response.data.error);
        } else {
          toast.error("خطا در آپلود فیش پرداخت");
        }
      } else {
        toast.error("خطا در ارتباط با سرور");
      }
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground-muted">در حال بارگذاری سفارش...</div>;

  // 🔴 اصلاحیه مهم: اگر لودینگ تمام شد ولی اردر نال بود (مثلا در حال ریدایرکت)، هیچی نشون نده تا کرش نکنه
  if (!order) return null;

  return (
    <div className="min-h-screen bg-background py-12 px-4 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        
        {/* هدر صفحه */}
        <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-foreground mb-2">تکمیل فرآیند خرید</h1>
            <p className="text-foreground-muted">لطفا مبلغ سفارش را به شماره کارت زیر واریز کرده و فیش را آپلود کنید.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* ستون راست: اطلاعات پرداخت */}
            <div className="space-y-6">
                
                {/* کارت بانکی گرافیکی */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3"></div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-8">
                            <CreditCard className="w-8 h-8 opacity-80" />
                            <span className="font-bold opacity-80">MarkazTech Bank</span>
                        </div>
                        <div className="mb-6">
                            <label className="text-xs opacity-70 block mb-1">شماره کارت</label>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-mono tracking-widest drop-shadow-md">6037 9911 2233 4455</span>
                                <button 
                                    onClick={() => {navigator.clipboard.writeText("6037991122334455"); toast.success("کپی شد")}}
                                    className="p-1 hover:bg-white/20 rounded-md transition-colors"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <label className="text-xs opacity-70 block mb-1">به نام</label>
                                <span className="font-bold">مرکز تک شیراز</span>
                            </div>
                            <div>
                                <label className="text-xs opacity-70 block mb-1">مبلغ قابل پرداخت</label>
                                {/* اینجا قبلا ارور میداد چون order نال بود */}
                                <span className="text-xl font-black">{formatPrice(order.total_price)} تومان</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* خلاصه سفارش */}
                <div className="bg-card border border-border rounded-2xl p-5">
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-primary" />
                        خلاصه سفارش #{order.id}
                    </h3>
                    <ul className="space-y-2 mb-4">
                        {order.items && order.items.length > 0 ? (
                            order.items.map((item, index) => (
                                <li key={index} className="flex justify-between text-sm text-foreground-muted">
                                    <span>{item.quantity} x {item.title}</span>
                                    <span>{formatPrice(item.price * item.quantity)}</span>
                                </li>
                            ))
                        ) : (
                            <li className="text-sm text-foreground-muted">در حال بارگذاری آیتم‌ها...</li>
                        )}
                    </ul>
                    <div className="border-t border-border pt-3 flex justify-between font-bold text-foreground">
                        <span>جمع کل</span>
                        <span>{formatPrice(order.total_price)} تومان</span>
                    </div>
                </div>
            </div>

            {/* ستون چپ: آپلود فیش */}
            <div className="bg-card border border-border rounded-3xl p-6 md:p-8 flex flex-col justify-between">
                <div>
                    <h3 className="font-bold text-foreground text-lg mb-6 flex items-center gap-2">
                        <UploadCloud className="w-6 h-6 text-primary" />
                        آپلود رسید پرداخت
                    </h3>
                    
                    <label className="block w-full cursor-pointer group">
                        <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${file ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-border hover:border-primary hover:bg-secondary'}`}>
                            {file ? (
                                <div className="flex flex-col items-center gap-2 text-green-600 dark:text-green-400">
                                    <CheckCircle2 className="w-10 h-10" />
                                    <span className="font-bold text-sm truncate max-w-[200px]">{file.name}</span>
                                    <span className="text-xs text-foreground-muted">برای تغییر کلیک کنید</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-foreground-muted group-hover:text-primary">
                                    <UploadCloud className="w-10 h-10" />
                                    <span className="font-bold text-sm">انتخاب تصویر فیش</span>
                                    <span className="text-xs opacity-70">JPG, PNG (max 5MB)</span>
                                </div>
                            )}
                            <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                        </div>
                    </label>
                </div>

                <div className="mt-8 space-y-3">
                    <button 
                        onClick={handleUpload}
                        disabled={uploading || !file}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {uploading ? "در حال ارسال..." : "تایید و ثبت نهایی"}
                    </button>
                    
                    <button 
                        onClick={() => router.push('/dashboard')}
                        className="w-full py-3 text-foreground-muted hover:text-foreground text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        بازگشت به داشبورد (پرداخت بعداً)
                    </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}