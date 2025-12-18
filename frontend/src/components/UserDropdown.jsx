// مسیر: src/components/UserDropdown.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import { 
  User, Settings, LogOut, BarChart3, 
  Receipt, Moon, Sun, ChevronDown,
  Shield, Wallet, Package
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getAvatarUrl } from "@/lib/avatar";

export default function UserDropdown() {
  const { user, logout } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef(null);

  // برای جلوگیری از ارور هیدراسیون
  useEffect(() => {
    setMounted(true);
  }, []);

  // بستن dropdown وقتی خارج از آن کلیک شود
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isAdmin = user?.is_staff || user?.is_superuser || user?.role === 'ADMIN';

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  if (!user) return null;

  // Debug: Log user data to see avatar value
  console.log("UserDropdown - User data:", user);
  console.log("UserDropdown - Avatar URL:", user.avatar);
  console.log("UserDropdown - Full Avatar URL:", getAvatarUrl(user.avatar));

  return (
    <div className="relative" ref={dropdownRef}>
      {/* دکمه اصلی */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl hover:bg-primary/20 text-primary transition-all group"
      >
        {/* آواتار */}
        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center overflow-hidden border border-primary/30">
          {user.avatar ? (
            <img 
              src={getAvatarUrl(user.avatar)} 
              alt="پروفایل" 
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error("Avatar image failed to load:", getAvatarUrl(user.avatar));
                e.target.style.display = 'none';
              }}
              onLoad={() => {
                console.log("Avatar image loaded successfully:", getAvatarUrl(user.avatar));
              }}
            />
          ) : (
            <User className="w-4 h-4" />
          )}
        </div>
        
        {/* نام کاربر */}
        <div className="hidden sm:block text-right">
          <p className="font-bold text-sm leading-tight">{user.full_name || "کاربر"}</p>
          <p className="text-xs text-primary/70">حساب من</p>
        </div>

        {/* آیکون فلش */}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* منوی dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-theme-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* هدر پروفایل */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center overflow-hidden border-2 border-primary/30">
                {user.avatar ? (
                  <img 
                    src={getAvatarUrl(user.avatar)} 
                    alt="پروفایل" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("Large avatar image failed to load:", getAvatarUrl(user.avatar));
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <User className="w-8 h-8 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-foreground">{user.full_name || "کاربر ناشناس"}</h3>
                  {isAdmin && (
                    <span className="bg-error/10 text-error text-xs px-2 py-0.5 rounded-full font-bold border border-error/20 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      مدیر
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground-muted dir-ltr">{user.mobile}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-foreground-muted">
                  <Wallet className="w-3 h-3" />
                  <span>موجودی: {formatPrice(user.wallet_balance || 0)} تومان</span>
                </div>
              </div>
            </div>
          </div>

          {/* منوهای اصلی */}
          <div className="p-2">
            
            {/* داشبورد */}
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary text-foreground hover:text-primary transition-colors group"
            >
              <BarChart3 className="w-5 h-5 text-foreground-muted group-hover:text-primary" />
              <span className="font-medium">داشبورد</span>
            </Link>

            {/* ویرایش پروفایل */}
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary text-foreground hover:text-primary transition-colors group"
            >
              <Settings className="w-5 h-5 text-foreground-muted group-hover:text-primary" />
              <span className="font-medium">ویرایش پروفایل</span>
            </Link>

            {/* سفارش‌ها */}
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary text-foreground hover:text-primary transition-colors group"
            >
              <Receipt className="w-5 h-5 text-foreground-muted group-hover:text-primary" />
              <span className="font-medium">سفارش‌های من</span>
            </Link>

            {/* مدیریت محصولات (فقط ادمین) */}
            {isAdmin && (
              <Link
                href="/admin/products/add"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary text-foreground hover:text-primary transition-colors group"
              >
                <Package className="w-5 h-5 text-foreground-muted group-hover:text-primary" />
                <span className="font-medium">مدیریت محصولات</span>
              </Link>
            )}

            {/* جداکننده */}
            <div className="border-t border-border my-2"></div>

            {/* تغییر تم */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary text-foreground hover:text-primary transition-colors group w-full"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="w-5 h-5 text-foreground-muted group-hover:text-primary" />
                ) : (
                  <Moon className="w-5 h-5 text-foreground-muted group-hover:text-primary" />
                )}
                <span className="font-medium">
                  {resolvedTheme === "dark" ? "تم روشن" : "تم تاریک"}
                </span>
              </button>
            )}

            {/* جداکننده */}
            <div className="border-t border-border my-2"></div>

            {/* خروج */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-error/10 text-error hover:text-error transition-colors group w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">خروج از حساب</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}