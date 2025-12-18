"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { 
  User, Phone, Mail, Calendar, 
  Camera, Save, Loader2, 
  ArrowRight, Wallet, Shield, Edit3
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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        birth_date: user.birth_date || "",
      });
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
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
      
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      if (avatarFile) {
        submitData.append('avatar', avatarFile);
      }

      await api.patch("/users/profile/", submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success("پروفایل با موفقیت بروزرسانی شد");
      await refreshUser();
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Profile update error:", error);
      const errorMsg = error.response?.data?.detail || "خطا در بروزرسانی پروفایل";
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2.5 bg-card border border-border text-foreground-muted hover:text-foreground hover:bg-secondary rounded-xl transition-all"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground">ویرایش پروفایل</h1>
            <p className="text-foreground-muted text-sm">اطلاعات شخصی خود را مدیریت کنید</p>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-3xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <div className="w-28 h-28 md:w-32 md:h-32 bg-secondary rounded-2xl flex items-center justify-center overflow-hidden border-4 border-card shadow-xl">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="پروفایل" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-14 h-14 text-foreground-muted" />
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-3 rounded-xl cursor-pointer hover:bg-primary/90 transition-all shadow-lg group-hover:scale-110">
                  <Camera className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              
              <div className="text-center md:text-right flex-1">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <h2 className="text-2xl font-black text-foreground">{user.full_name || "کاربر مرکزتک"}</h2>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 text-xs bg-error/10 text-error px-2.5 py-1 rounded-full font-bold border border-error/20">
                      <Shield className="w-3 h-3" />
                      مدیر
                    </span>
                  )}
                </div>
                <p className="text-foreground-muted flex items-center justify-center md:justify-start gap-2">
                  <Phone className="w-4 h-4" />
                  {user.mobile}
                </p>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                  <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-xl">
                    <Wallet className="w-5 h-5 text-primary" />
                    <span className="font-bold text-foreground">{new Intl.NumberFormat('fa-IR').format(user.wallet_balance || 0)}</span>
                    <span className="text-foreground-muted text-sm">تومان</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground-muted text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>عضویت از {new Date(user.date_joined).toLocaleDateString('fa-IR')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Edit3 className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground text-lg">اطلاعات پروفایل</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  نام و نام خانوادگی
                </label>
                <div className="relative">
                  <User className="absolute right-4 top-3.5 text-foreground-muted w-5 h-5" />
                  <input
                    type="text"
                    className="w-full bg-secondary border border-border rounded-xl py-3.5 pr-12 pl-4 outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-foreground-muted transition-all"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="نام کامل خود را وارد کنید"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  شماره موبایل
                </label>
                <div className="relative">
                  <Phone className="absolute right-4 top-3.5 text-foreground-muted w-5 h-5" />
                  <input
                    type="text"
                    className="w-full bg-secondary/50 border border-border rounded-xl py-3.5 pr-12 pl-4 outline-none text-foreground-muted cursor-not-allowed"
                    value={user.mobile}
                    disabled
                  />
                </div>
                <p className="text-xs text-foreground-muted mt-1.5 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  شماره موبایل قابل تغییر نیست
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ایمیل (اختیاری)
                </label>
                <div className="relative">
                  <Mail className="absolute right-4 top-3.5 text-foreground-muted w-5 h-5" />
                  <input
                    type="email"
                    className="w-full bg-secondary border border-border rounded-xl py-3.5 pr-12 pl-4 outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-foreground-muted transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@email.com"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  تاریخ تولد (اختیاری)
                </label>
                <div className="relative">
                  <Calendar className="absolute right-4 top-3.5 text-foreground-muted w-5 h-5" />
                  <input
                    type="date"
                    className="w-full bg-secondary border border-border rounded-xl py-3.5 pr-12 pl-4 outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground transition-all"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-8 border-t border-border mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="flex-1 sm:flex-initial sm:px-8 border border-border hover:border-foreground-muted text-foreground-muted hover:text-foreground py-3.5 rounded-xl font-medium transition-all"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
