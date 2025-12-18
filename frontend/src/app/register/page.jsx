// مسیر: src/app/register/page.jsx
"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Phone, Lock, User, Loader2, Eye, EyeOff, Camera, Upload } from "lucide-react";
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

  // اعتبارسنجی شماره موبایل
  const validateMobile = (mobile) => {
    const mobileRegex = /^09\d{9}$/;
    return mobileRegex.test(mobile);
  };

  // اعتبارسنجی رمز عبور
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // مدیریت آپلود آواتار
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
    
    // اعتبارسنجی فرم
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
      // ارسال داده‌ها به صورت FormData برای پشتیبانی از آپلود فایل
      const submitData = new FormData();
      submitData.append('mobile', formData.mobile);
      submitData.append('password', formData.password);
      submitData.append('full_name', formData.full_name.trim());
      
      // اضافه کردن آواتار اگر انتخاب شده
      if (avatarFile) {
        submitData.append('avatar', avatarFile);
      }

      const response = await api.post("/users/register/", submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success("حساب کاربری با موفقیت ساخته شد!");
      console.log("Registration successful:", response.data);
      
      // هدایت به لاگین بعد از 2 ثانیه
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      console.error("Registration error:", err);
      
      // نمایش خطاهای مختلف
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="card-base w-full max-w-md p-8 rounded-3xl shadow-theme-lg">
        <div className="text-center mb-8">
          <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
            <UserPlus className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-foreground">عضویت در مرکز تک</h1>
          <p className="text-foreground-muted mt-2 text-sm">به جمع هزاران کاربر ما بپیوندید</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* آپلود آواتار */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden border-2 border-border">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="پیش‌نمایش آواتار" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-foreground-muted" />
                )}
              </div>
              <label className="absolute bottom-0 right-1/2 translate-x-1/2 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary-hover transition-colors">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-foreground-muted">
              عکس پروفایل (اختیاری - حداکثر 5MB)
            </p>
          </div>

          {/* نام و نام خانوادگی */}
          <div className="relative">
            <User className="absolute right-4 top-3.5 text-foreground-muted w-5 h-5" />
            <input
              type="text"
              placeholder="نام و نام خانوادگی"
              className="w-full bg-secondary border border-border rounded-xl py-3 pr-12 pl-4 outline-none focus:ring-2 focus:ring-primary text-foreground transition-all"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
              minLength={2}
            />
          </div>

          {/* شماره موبایل */}
          <div className="relative">
            <Phone className="absolute right-4 top-3.5 text-foreground-muted w-5 h-5" />
            <input
              type="tel"
              placeholder="شماره موبایل (09xxxxxxxxx)"
              className={`w-full bg-secondary border rounded-xl py-3 pr-12 pl-4 outline-none focus:ring-2 text-foreground transition-all ${
                formData.mobile && !validateMobile(formData.mobile) 
                  ? 'border-error focus:ring-error' 
                  : 'border-border focus:ring-primary'
              }`}
              value={formData.mobile}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ''); // فقط اعداد
                if (value.length <= 11) {
                  setFormData({ ...formData, mobile: value });
                }
              }}
              required
              maxLength={11}
              dir="ltr"
            />
            {formData.mobile && !validateMobile(formData.mobile) && (
              <p className="text-xs text-error mt-1">شماره موبایل باید با 09 شروع شود و 11 رقم باشد</p>
            )}
          </div>

          {/* رمز عبور */}
          <div className="relative">
            <Lock className="absolute right-4 top-3.5 text-foreground-muted w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="رمز عبور (حداقل 6 کاراکتر)"
              className={`w-full bg-secondary border rounded-xl py-3 pr-12 pl-12 outline-none focus:ring-2 text-foreground transition-all ${
                formData.password && !validatePassword(formData.password)
                  ? 'border-error focus:ring-error'
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
            {formData.password && !validatePassword(formData.password) && (
              <p className="text-xs text-error mt-1">رمز عبور باید حداقل 6 کاراکتر باشد</p>
            )}
          </div>

          {/* تکرار رمز عبور */}
          <div className="relative">
            <Lock className="absolute right-4 top-3.5 text-foreground-muted w-5 h-5" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="تکرار رمز عبور"
              className={`w-full bg-secondary border rounded-xl py-3 pr-12 pl-12 outline-none focus:ring-2 text-foreground transition-all ${
                formData.confirmPassword && formData.password !== formData.confirmPassword
                  ? 'border-error focus:ring-error'
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
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-xs text-error mt-1">رمز عبور و تکرار آن یکسان نیستند</p>
            )}
          </div>

          {/* راهنمای رمز عبور */}
          <div className="bg-secondary/50 rounded-lg p-3 text-xs text-foreground-muted">
            <p className="font-medium mb-1">الزامات رمز عبور:</p>
            <ul className="space-y-1">
              <li className={formData.password.length >= 6 ? 'text-success' : ''}>
                • حداقل 6 کاراکتر
              </li>
              <li>• ترکیبی از حروف و اعداد توصیه می‌شود</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isLoading || !formData.full_name || !validateMobile(formData.mobile) || !validatePassword(formData.password) || formData.password !== formData.confirmPassword}
            className="btn-primary w-full py-3.5 rounded-xl shadow-theme flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

        <div className="mt-6 text-center text-sm text-foreground-muted">
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">وارد شوید</Link>
        </div>
      </div>
    </div>
  );
}