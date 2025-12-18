// مسیر: src/components/Header.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingCart, User, Menu, ChevronLeft, Sun, Moon } from "lucide-react";
import api from "@/lib/axios";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import UserDropdown from "./UserDropdown";
import SearchModal from "./SearchModal";

export default function Header() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { cart } = useCart();
  const { user } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();

  // برای جلوگیری از ارور هیدراسیون
  const [mounted, setMounted] = useState(false);

  // محاسبه مجموع تعداد کالاها
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    setMounted(true);

    // کیبورد شورتکات برای جستجو
    const handleKeyboard = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyboard);
    return () => document.removeEventListener("keydown", handleKeyboard);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // آدرس نهایی می‌شود: http://localhost:8000/api/products/categories/
        // دقت کن که اسلش آخر (/) در جنگو معمولا اجباری است
        const response = await api.get("/products/categories/");
        setCategories(response.data);
      } catch (error) {
        console.error("خطا در دریافت دسته‌بندی‌ها:", error);
        // جهت دیباگ: لاگ بگیر ببین سرور چی میگه
        if (error.response) {
          console.log("Server response:", error.response.data);
          console.log("Status code:", error.response.status);
        }
        // Set empty array on error to prevent UI issues
        setCategories([]);
      } finally {
        // Always set loading to false when done
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4 md:gap-8">

        {/* لوگو */}
        <Link href="/" className="text-2xl font-black text-primary tracking-tighter">
          Markaz<span className="text-foreground">Tech</span>
        </Link>

        {/* نوار جستجو */}
        <div className="hidden md:flex flex-1 max-w-2xl relative">
          <button
            onClick={() => setSearchModalOpen(true)}
            className="w-full bg-secondary border border-border text-foreground-muted rounded-xl py-3 pr-12 pl-16 text-right hover:border-primary transition-all flex items-center justify-between"
          >
            <span>جستجو در بین هزاران محصول...</span>
            <div className="flex items-center gap-1 text-xs bg-border px-2 py-1 rounded-md">
              <span>Ctrl</span>
              <span>+</span>
              <span>K</span>
            </div>
          </button>
          <Search className="absolute right-4 top-3.5 text-foreground-muted w-5 h-5 pointer-events-none" />
        </div>

        {/* دکمه جستجو موبایل */}
        <button
          onClick={() => setSearchModalOpen(true)}
          className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <Search className="w-6 h-6 text-foreground-muted" />
        </button>

        {/* دکمه‌های سمت چپ */}
        <div className="flex items-center gap-3">

          {/* دکمه تم (برای همه کاربران) */}
          {mounted && !user && (
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2 hover:bg-secondary rounded-lg transition-colors text-foreground-muted hover:text-foreground relative w-10 h-10 flex items-center justify-center"
            >
              <Sun className="h-6 w-6 absolute transition-all duration-300 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
              <Moon className="h-6 w-6 absolute transition-all duration-300 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
            </button>
          )}

          {/* سبد خرید */}
          <Link href="/cart" className="p-2 hover:bg-secondary rounded-lg transition-colors relative">
            <ShoppingCart className="w-6 h-6 text-foreground-muted hover:text-foreground transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-error-foreground text-xs font-bold flex items-center justify-center rounded-full border-2 border-card animate-bounce">
                {cartCount}
              </span>
            )}
          </Link>

          {/* پروفایل / ورود */}
          {user ? (
            <UserDropdown />
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/register" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary-hover transition-all">
                <User className="w-5 h-5" />
                <span className="font-medium text-sm hidden sm:block">ثبت‌نام</span>
              </Link>
              <Link href="/login" className="flex items-center gap-2 border border-border px-4 py-2 rounded-lg hover:border-primary hover:text-primary text-foreground-muted transition-all">
                <User className="w-5 h-5" />
                <span className="font-medium text-sm hidden sm:block">ورود</span>
              </Link>
            </div>
          )}

        </div>
      </div>

      {/* منوی دسته‌بندی‌ها */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-12">

            <div className="group relative h-full flex items-center">
              <button className="flex items-center gap-2 font-bold text-foreground hover:text-primary transition-colors h-full px-2">
                <Menu className="w-5 h-5" />
                دسته‌بندی کالاها
              </button>

              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute top-full right-0 w-64 bg-card shadow-theme-lg border border-border rounded-b-xl transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                <ul className="py-2">
                  {loading ? (
                    <li className="px-4 py-2 text-sm text-foreground-muted">در حال بارگذاری...</li>
                  ) : categories.length > 0 ? (
                    categories.map((cat) => (
                      <li key={cat.id} className="group/sub relative">
                        <Link href={`/category/${cat.slug}`} className="flex items-center justify-between px-4 py-3 hover:bg-secondary text-foreground hover:text-primary text-sm font-medium transition-colors">
                          <span>{cat.name}</span>
                          {cat.children && cat.children.length > 0 && <ChevronLeft className="w-4 h-4 text-foreground-muted" />}
                        </Link>
                        {cat.children && cat.children.length > 0 && (
                          <div className="invisible opacity-0 group-hover/sub:visible group-hover/sub:opacity-100 absolute top-0 right-full w-60 bg-card shadow-theme-lg border border-border rounded-xl mr-1 transition-all">
                            <ul className="py-2">
                              {cat.children.map((child) => (
                                <li key={child.id}>
                                  <Link href={`/category/${child.slug}`} className="block px-4 py-2.5 hover:bg-secondary text-foreground-secondary hover:text-primary text-sm transition-colors">
                                    {child.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2 text-sm text-foreground-muted">دسته‌ای یافت نشد</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* مودال جستجو */}
      <SearchModal 
        isOpen={searchModalOpen} 
        onClose={() => setSearchModalOpen(false)} 
      />
    </header>
  );
}