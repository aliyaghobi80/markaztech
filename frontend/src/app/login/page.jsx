// src/app/login/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import toast, { Toaster } from "react-hot-toast"; 

export default function LoginPage() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Sending data:", { mobile, password }); // لاگ

      // ✅ حالا میتونیم با خیال راحت mobile بفرستیم
      const res = await api.post('/users/login/', {
        mobile: mobile,  // 👈 دیگه لازم نیست username باشه
        password: password
      });

      // ذخیره توکن
      localStorage.setItem('accessToken', res.data.access);
      localStorage.setItem('refreshToken', res.data.refresh); // رفرش توکن هم ذخیره شود بهتر است
      
      toast.success("ورود موفقیت‌آمیز بود");
      
      // هدایت به داشبورد
      setTimeout(() => {
          window.location.href = '/dashboard'; 
      }, 1000);

    } catch (error) {
      console.error("Login Error Details:", error.response?.data); // 👈 لاگ دقیق ارور

      // مدیریت پیام خطا
      if (error.response?.status === 400) {
          // اگر ارور 400 داد، یعنی فیلدها ناقص است
          toast.error("لطفاً نام کاربری و رمز عبور را وارد کنید");
      } else if (error.response?.status === 401) {
          // اگر ارور 401 داد، یعنی رمز اشتباه است
          toast.error("شماره موبایل یا رمز عبور اشتباه است");
      } else {
          toast.error("خطا در برقراری ارتباط با سرور");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      {/* این کامپوننت برای نمایش پیام‌ها ضروری است */}
      <Toaster position="top-center" /> 
      
      <div className="w-full max-w-md card-base rounded-2xl shadow-theme-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-foreground">ورود به پنل</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">شماره موبایل</label>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-secondary text-foreground focus:ring-2 ring-primary outline-none transition"
              placeholder="0917..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">رمز عبور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-secondary text-foreground focus:ring-2 ring-primary outline-none transition"
              placeholder="••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 rounded-xl disabled:opacity-50"
          >
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </form>

        {/* لینک ثبت‌نام */}
        <div className="mt-6 text-center text-sm text-foreground-muted">
          حساب کاربری ندارید؟{" "}
          <Link href="/register" className="text-primary font-bold hover:underline">
            ثبت‌نام کنید
          </Link>
        </div>
      </div>
    </div>
  );
}