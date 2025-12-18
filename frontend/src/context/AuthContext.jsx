// مسیر: src/context/AuthContext.jsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

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

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);