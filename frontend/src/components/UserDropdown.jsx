// مسیر: src/components/UserDropdown.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { 
  User, Settings, LogOut, BarChart3, 
  ChevronDown, Shield, Wallet, ShoppingBag
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getAvatarUrl } from "@/lib/avatar";

export default function UserDropdown() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdmin = user?.role === 'ADMIN' || user?.is_staff;

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-secondary hover:bg-secondary-hover px-2 py-2 md:px-4 md:py-2 rounded-xl transition-all border border-border group"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
          {user.avatar ? (
            <img src={getAvatarUrl(user.avatar)} alt={user.full_name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-primary" />
          )}
        </div>
        <div className="hidden md:block text-right">
          <p className="font-bold text-xs text-foreground leading-tight">{user.full_name || "کاربر"}</p>
          <p className="text-[10px] text-foreground-muted">حساب کاربری</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-foreground-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-theme-lg overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
          <div className="p-4 bg-secondary/30 border-b border-border">
            <p className="font-black text-sm text-foreground mb-1">{user.full_name}</p>
            <div className="flex items-center gap-1 text-[10px] text-foreground-muted">
              <Wallet className="w-3 h-3" />
              <span>موجودی: {formatPrice(user.wallet_balance || 0)} تومان</span>
            </div>
          </div>

          <div className="p-2">
              <Link 
                href="/dashboard" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary rounded-xl text-sm font-bold transition-colors"
              >
                <BarChart3 className="w-4 h-4 text-primary" />
                پنل کاربری
              </Link>
              
              {isAdmin && (
                <Link 
                  href="/admin" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary rounded-xl text-sm font-bold text-primary transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  مدیریت سیستم
                </Link>
              )}

            <Link 
              href="/dashboard?tab=orders" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary rounded-xl text-sm font-medium transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-foreground-muted" />
              سفارش‌های من
            </Link>

            <Link 
              href="/profile" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary rounded-xl text-sm font-medium transition-colors"
            >
              <Settings className="w-4 h-4 text-foreground-muted" />
              تنظیمات پروفایل
            </Link>

            <div className="border-t border-border my-2 mx-2"></div>

            <button 
              onClick={() => { logout(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-error/10 text-error rounded-xl text-sm font-bold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              خروج از حساب
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
