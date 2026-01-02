// مسیر: src/app/profile/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { 
  User, Phone, Mail, Calendar, 
  Upload, Camera, Save, Loader2, 
  ArrowRight, Wallet, Shield
} from "lucide-react";

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    birth_date: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ریدایرکت اگر لاگین نیست
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // تنظیم داده‌های اولیه
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        birth_date: user.birth_date || "",
      });
      setAvatarPreview(user.avatar_url || null);
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("حجم فایل نباید بیشتر از 5 مگابایت باشد");
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = new FormData();
      
      // اضافه کردن فیلدهای متنی
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        if (value !== null && value !== undefined && value !== '') {
          let processedValue = value;
          
          // تبدیل تاریخ به فرمت مناسب
          if (key === 'birth_date' && typeof value === 'object' && value.format) {
            processedValue = value.format('YYYY-MM-DD');
          }
          
          submitData.append(key, processedValue);
        }
      });

      // اضافه کردن فایل آواتار
      if (avatarFile) {
        submitData.append('avatar', avatarFile);
      }

      console.log('Submitting profile data:');
      for (let [key, value] of submitData.entries()) {
        console.log(key, ':', value);
      }

      const response = await api.patch("/users/profile/", submitData);
      // Note: Removed Content-Type header to let browser set it automatically for FormData

      toast.success("پروفایل با موفقیت بروزرسانی شد");
      
      // رفرش اطلاعات کاربر برای نمایش آواتار جدید
      await refreshUser();
      
      // بازگشت به داشبورد بعد از 1.5 ثانیه
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Profile update error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      let errorMsg = "خطا در بروزرسانی پروفایل";
      
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          // نمایش اولین خطای validation
          const firstError = Object.values(error.response.data)[0];
          if (Array.isArray(firstError)) {
            errorMsg = firstError[0];
          } else if (typeof firstError === 'string') {
            errorMsg = firstError;
          }
        } else if (error.response.data.detail) {
          errorMsg = error.response.data.detail;
        }
      }
      
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isAdmin = user.is_staff || user.is_superuser || user.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        
        {/* هدر */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 text-foreground-muted hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-foreground">ویرایش پروفایل</h1>
            <p className="text-foreground-muted">اطلاعات شخصی خود را بروزرسانی کنید</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          
          {/* نمایش اطلاعات فعلی */}
          <div className="bg-secondary/30 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center overflow-hidden border-2 border-border">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="پروفایل فعلی" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-foreground-muted" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">{user.full_name || "نام نامشخص"}</h3>
                <p className="text-foreground-muted flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {user.mobile}
                </p>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 text-xs bg-error/10 text-error px-2 py-1 rounded-full font-bold border border-error/20 mt-1">
                    <Shield className="w-3 h-3" />
                    مدیر سیستم
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-foreground-muted">
              <div className="flex items-center gap-1">
                <Wallet className="w-4 h-4" />
                <span>موجودی: {new Intl.NumberFormat('fa-IR').format(user.wallet_balance || 0)} تومان</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>عضو از: {new Date(user.date_joined).toLocaleDateString('fa-IR')}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* آپلود آواتار */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden border-4 border-border">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="پیش‌نمایش آواتار" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-foreground-muted" />
                  )}
                </div>
                <label className="absolute bottom-2 right-1/2 translate-x-1/2 bg-primary text-primary-foreground p-3 rounded-full cursor-pointer hover:bg-primary-hover transition-colors shadow-lg">
                  <Camera className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-foreground-muted">
                برای تغییر عکس پروفایل کلیک کنید (حداکثر 5MB)
              </p>
            </div>

            {/* فرم اطلاعات */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* نام کامل */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  نام و نام خانوادگی
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-3 text-foreground-muted w-5 h-5" />
                  <input
                    type="text"
                    className="w-full bg-secondary border border-border rounded-xl py-3 pr-10 pl-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="نام کامل خود را وارد کنید"
                  />
                </div>
              </div>

              {/* شماره موبایل (غیرقابل تغییر) */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  شماره موبایل
                </label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 text-foreground-muted w-5 h-5" />
                  <input
                    type="text"
                    className="w-full bg-secondary/50 border border-border rounded-xl py-3 pr-10 pl-4 outline-none text-foreground-muted cursor-not-allowed"
                    value={user.mobile}
                    disabled
                  />
                </div>
                <p className="text-xs text-foreground-muted mt-1">
                  شماره موبایل قابل تغییر نیست
                </p>
              </div>

              {/* ایمیل */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ایمیل (اختیاری)
                </label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 text-foreground-muted w-5 h-5" />
                  <input
                    type="email"
                    className="w-full bg-secondary border border-border rounded-xl py-3 pr-10 pl-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@email.com"
                  />
                </div>
              </div>

                {/* تاریخ تولد */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    تاریخ تولد (اختیاری)
                  </label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-3 text-foreground-muted w-5 h-5 z-10" />
                    <DatePicker
                      calendar={persian}
                      locale={persian_fa}
                      calendarPosition="bottom-right"
                      inputClass="w-full bg-secondary border border-border rounded-xl py-3 pr-10 pl-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
                      containerClassName="w-full"
                      value={formData.birth_date}
                      onChange={(date) => setFormData({ ...formData, birth_date: date })}
                      placeholder="تاریخ تولد خود را انتخاب کنید"
                      format="YYYY/MM/DD"
                    />
                  </div>
                </div>
            </div>

            {/* دکمه‌های عملیات */}
            <div className="flex gap-4 pt-6 border-t border-border">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 btn-primary py-3 rounded-xl flex items-center justify-center gap-2 shadow-theme"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    ذخیره تغییرات
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 btn-secondary py-3 rounded-xl"
              >
                لغو
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}