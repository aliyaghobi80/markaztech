"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Phone, Lock, User, Loader2, Eye, EyeOff, Camera, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ 
    mobile: "", 
    password: "", 
    confirmPassword: "",
    full_name: "" 
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const validateMobile = (mobile) => {
    const mobileRegex = /^09\d{9}$/;
    return mobileRegex.test(mobile);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

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
    
    if (!formData.full_name.trim()) {
      toast.error("نام و نام خانوادگی الزامی است");
      return;
    }

    if (!validateMobile(formData.mobile)) {
      toast.error("شماره موبایل باید با 09 شروع شود و 11 رقم باشد");
      return;
    }

    if (!validatePassword(formData.password)) {
      toast.error("رمز عبور باید حداقل 6 کاراکتر باشد");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("رمز عبور و تکرار آن یکسان نیستند");
      return;
    }

    setIsLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('mobile', formData.mobile);
      submitData.append('password', formData.password);
      submitData.append('full_name', formData.full_name.trim());
      
      if (avatarFile) {
        submitData.append('avatar', avatarFile);
      }

      const response = await api.post("/users/register/", submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success("حساب کاربری با موفقیت ساخته شد!");
      
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      console.error("Registration error:", err);
      
      if (err.response?.data) {
        const errors = err.response.data;
        if (errors.mobile) {
          toast.error("این شماره موبایل قبلاً ثبت شده است");
        } else if (errors.password) {
          toast.error("رمز عبور معتبر نیست");
        } else if (errors.full_name) {
          toast.error("نام و نام خانوادگی معتبر نیست");
        } else {
          toast.error("خطا در ثبت‌نام. لطفاً دوباره تلاش کنید");
        }
      } else {
        toast.error("خطا در اتصال به سرور");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 dark:from-slate-950 dark:via-blue-950/30 dark:to-slate-900"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-card border border-border rounded-3xl shadow-2xl p-8 backdrop-blur-sm">
          <div className="text-center mb-6">
            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
              <UserPlus className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-foreground">عضویت در مرکزتک</h1>
            <p className="text-foreground-muted mt-2 text-sm">به جمع هزاران کاربر ما بپیوندید</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="text-center mb-2">
              <div className="relative inline-block">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto overflow-hidden border-2 border-border">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="پیش‌نمایش آواتار" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-foreground-muted" />
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-foreground-muted mt-2">
                عکس پروفایل (اختیاری)
              </p>
            </div>

              <div className="relative">
                <User className="absolute right-4 top-3.5 text-foreground-muted w-5 h-5" />
                <input
                  type="text"
                  placeholder="نام و نام خانوادگی"
                  className={`w-full bg-secondary border rounded-xl py-3 pr-12 pl-4 outline-none focus:ring-2 text-foreground placeholder:text-foreground-muted transition-all ${
                    formData.full_name && formData.full_name.trim().length >= 2
                      ? 'border-green-500 focus:ring-green-500'
                      : 'border-border focus:ring-primary'
                  }`}
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  minLength={2}
                />
              </div>

              <div className="relative">
                <Phone className="absolute right-4 top-3.5 text-foreground-muted w-5 h-5" />
                <input
                  type="tel"
                  placeholder="شماره موبایل (09xxxxxxxxx)"
                  className={`w-full bg-secondary border rounded-xl py-3 pr-12 pl-4 outline-none focus:ring-2 text-foreground placeholder:text-foreground-muted transition-all ${
                    formData.mobile && !validateMobile(formData.mobile) 
                      ? 'border-red-500 focus:ring-red-500' 
                      : formData.mobile && validateMobile(formData.mobile)
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-border focus:ring-primary'
                  }`}
                  value={formData.mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 11) {
                      setFormData({ ...formData, mobile: value });
                    }
                  }}
                  required
                  maxLength={11}
                  dir="ltr"
                />
              </div>

              <div className="relative">
                <Lock className="absolute right-4 top-3.5 text-foreground-muted w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="رمز عبور (حداقل 6 کاراکتر)"
                  className={`w-full bg-secondary border rounded-xl py-3 pr-12 pl-12 outline-none focus:ring-2 text-foreground placeholder:text-foreground-muted transition-all ${
                    formData.password && !validatePassword(formData.password)
                      ? 'border-red-500 focus:ring-red-500'
                      : formData.password && validatePassword(formData.password)
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-border focus:ring-primary'
                  }`}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-3.5 text-foreground-muted hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute right-4 top-3.5 text-foreground-muted w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="تکرار رمز عبور"
                  className={`w-full bg-secondary border rounded-xl py-3 pr-12 pl-12 outline-none focus:ring-2 text-foreground placeholder:text-foreground-muted transition-all ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-500 focus:ring-red-500'
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-border focus:ring-primary'
                  }`}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-4 top-3.5 text-foreground-muted hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

            <div className="bg-secondary/50 rounded-xl p-3 text-xs text-foreground-muted border border-border">
              <p className="font-medium mb-2 text-foreground-secondary">الزامات رمز عبور:</p>
              <ul className="space-y-1">
                <li className={`flex items-center gap-2 ${formData.password.length >= 6 ? 'text-green-500' : ''}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${formData.password.length >= 6 ? 'bg-green-500' : 'bg-foreground-muted/50'}`}></div>
                  حداقل 6 کاراکتر
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground-muted/50"></div>
                  ترکیبی از حروف و اعداد توصیه می‌شود
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.full_name || !validateMobile(formData.mobile) || !validatePassword(formData.password) || formData.password !== formData.confirmPassword}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  در حال ثبت‌نام...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  ساخت حساب کاربری
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-foreground-muted">
              قبلاً ثبت‌نام کرده‌اید؟{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">وارد شوید</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-foreground-muted text-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>اطلاعات شما با رمزنگاری پیشرفته محافظت می‌شود</span>
          </div>
        </div>
      </div>
    </div>
  );
}
