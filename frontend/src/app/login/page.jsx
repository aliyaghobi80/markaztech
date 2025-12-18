"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import toast from "react-hot-toast"; 
import { LogIn, Phone, Lock, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/users/login/', {
        mobile: mobile,
        password: password
      });

      localStorage.setItem('accessToken', res.data.access);
      localStorage.setItem('refreshToken', res.data.refresh);
      
      toast.success("ورود موفقیت‌آمیز بود");
      
      setTimeout(() => {
          window.location.href = '/dashboard'; 
      }, 1000);

    } catch (error) {
      console.error("Login Error Details:", error.response?.data);

      if (error.response?.status === 400) {
          toast.error("لطفاً شماره موبایل و رمز عبور را وارد کنید");
      } else if (error.response?.status === 401) {
          toast.error("شماره موبایل یا رمز عبور اشتباه است");
      } else {
          toast.error("خطا در برقراری ارتباط با سرور");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 dark:from-slate-950 dark:via-blue-950/30 dark:to-slate-900"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-card border border-border rounded-3xl shadow-2xl p-8 backdrop-blur-sm">
          <div className="text-center mb-8">
            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
              <LogIn className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-foreground">ورود به حساب کاربری</h1>
            <p className="text-foreground-muted mt-2 text-sm">به مرکزتک خوش آمدید</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Phone className="absolute right-4 top-3.5 text-foreground-muted w-5 h-5" />
              <input
                type="text"
                value={mobile}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 11) {
                    setMobile(value);
                  }
                }}
                className="w-full bg-secondary border border-border rounded-xl py-3.5 pr-12 pl-4 outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-foreground-muted transition-all"
                placeholder="شماره موبایل (09xxxxxxxxx)"
                required
                maxLength={11}
                dir="ltr"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute right-4 top-3.5 text-foreground-muted w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl py-3.5 pr-12 pl-12 outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-foreground-muted transition-all"
                placeholder="رمز عبور"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-3.5 text-foreground-muted hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !mobile || !password}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  در حال ورود...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  ورود به حساب
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-foreground-muted">
              حساب کاربری ندارید؟{" "}
              <Link href="/register" className="text-primary font-bold hover:underline">
                ثبت‌نام کنید
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-foreground-muted text-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>ورود امن با رمزنگاری پیشرفته</span>
          </div>
        </div>
      </div>
    </div>
  );
}
