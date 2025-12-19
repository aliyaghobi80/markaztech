// مسیر: src/context/AuthContext.jsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { mutate } from "swr";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // اطلاعات کاربر
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // چک کردن وضعیت لاگین هنگام لود سایت
  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    const token = localStorage.getItem("accessToken");

    // اگر اصلا توکن نداریم، کاری نکن (کاربر مهمان است)
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/users/profile/"); // یا هر آدرسی که یوزر رو میده
      setUser(response.data);
    } catch (error) {
      // اینجا دیگه لازم نیست کاری کنی، چون axios خودش ریدایرکت میکنه
      console.log("خطا در شناسایی کاربر، احتمالا توکن پریده");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (token, refreshToken) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", refreshToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    checkUserLoggedIn(); // دریافت اطلاعات کاربر بلافاصله بعد از لاگین
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    router.push("/login");
  };

  // تابع برای بروزرسانی اطلاعات کاربر (برای استفاده بعد از ویرایش پروفایل)
  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  // تابع برای رفرش اطلاعات کاربر از سرور
  const refreshUser = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const response = await api.get("/users/profile/");
      setUser(response.data);
    } catch (error) {
      console.error("خطا در رفرش اطلاعات کاربر:", error);
    }
  };

  // رفرش خودکار اطلاعات کاربر و اتصال وب‌سوکت
  useEffect(() => {
    if (!user) return;

    // اتصال وب‌سوکت برای موجودی کیف پول
    const token = localStorage.getItem("accessToken");
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/ws/wallet/?token=${token}`;
    let socket;

    try {
      socket = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === "wallet_update") {
            setUser(prevUser => ({
              ...prevUser,
              wallet_balance: data.balance
            }));
            } else if (data.type === 'wallet_request_update') {
              // رفرش کردن تمام لیست‌های مربوط به کیف پول در سراسر اپلیکیشن
              mutate("/users/wallet-requests/");
              
              // ایجاد یک رویداد سفارشی برای اطلاع‌رسانی به داشبورد
              const event = new CustomEvent('wallet_request_status_changed', { 
                detail: { 
                  request_id: data.request_id, 
                  status: data.status,
                  admin_note: data.admin_note
                } 
              });
              window.dispatchEvent(event);
            }
        };

      socket.onclose = () => {
        console.log("اتصال وب‌سوکت کیف پول قطع شد");
      };

      socket.onerror = (error) => {
        console.error("خطای وب‌سوکت:", error);
      };
    } catch (err) {
      console.error("خطا در ایجاد اتصال وب‌سوکت:", err);
    }

    // رفرش هنگام برگشت به تب
    const handleFocus = () => {
      refreshUser();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      if (socket) socket.close();
    };
  }, [user?.id]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);