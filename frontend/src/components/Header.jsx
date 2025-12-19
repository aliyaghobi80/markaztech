// مسیر: src/components/Header.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, ShoppingCart, User, Menu, ChevronLeft, 
  Sun, Moon, LayoutDashboard, ShieldCheck, X,
  ShoppingBag, Home, BookOpen
} from "lucide-react";
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
  const [scrolled, setScrolled] = useState(false);
  const { cart } = useCart();
  const { user } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const isAdmin = user?.role === 'ADMIN' || user?.is_staff;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/products/categories/");
        setCategories(response.data);
      } catch (error) {
        console.error("خطا در دریافت دسته‌بندی‌ها:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-card/80 backdrop-blur-xl shadow-lg border-b border-border py-2' 
        : 'bg-card border-b border-border py-3'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4">
          
            {/* لوگو و منوی موبایل */}
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-secondary rounded-xl transition-colors"
              >
                <Menu className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <Link href="/" className="flex items-center gap-2">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
                  <span className="text-white font-black text-base md:text-lg">M</span>
                </div>
                <span className="text-lg md:text-xl font-black hidden sm:block tracking-tighter whitespace-nowrap">
                  Markaz<span className="text-primary">Tech</span>
                </span>
              </Link>
            </div>

            {/* نویگیشن دسکتاپ */}
            <nav className="hidden lg:flex items-center gap-1 bg-secondary/50 p-1 rounded-2xl border border-border">
              <Link href="/" className="px-2 xl:px-3 py-2 hover:bg-card hover:shadow-sm rounded-xl transition-all text-xs xl:text-sm font-bold flex items-center gap-2 whitespace-nowrap">
                <Home className="w-4 h-4 text-primary" />
                خانه
              </Link>
                <Link href="/search" className="px-2 xl:px-3 py-2 hover:bg-card hover:shadow-sm rounded-xl transition-all text-xs xl:text-sm font-bold flex items-center gap-2 whitespace-nowrap">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                  محصولات
                </Link>
                <Link href="/articles" className="px-2 xl:px-3 py-2 hover:bg-card hover:shadow-sm rounded-xl transition-all text-xs xl:text-sm font-bold flex items-center gap-2 whitespace-nowrap">
                  <BookOpen className="w-4 h-4 text-primary" />
                  مقالات
                </Link>
              
                  <div className="group relative py-2">
                    <button className="px-2 xl:px-3 py-2 hover:bg-card hover:shadow-sm rounded-xl transition-all text-xs xl:text-sm font-bold flex items-center gap-2 whitespace-nowrap">
                      <LayoutDashboard className="w-4 h-4 text-primary" />
                      دسته‌بندی‌ها
                    </button>
                    <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute top-[calc(100%-5px)] right-0 w-64 bg-card shadow-2xl border border-border rounded-2xl transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50 p-2">

                    {loading ? (
                      <div className="p-4 text-center text-sm text-foreground-muted">درحال بارگذاری...</div>
                    ) : (
                      categories.map((cat) => (
                        <div key={cat.id} className="group/item relative">
                          <Link 
                            href={`/category/${cat.slug}`}
                            className="flex items-center justify-between px-3 py-2.5 hover:bg-primary/10 hover:text-primary rounded-xl transition-all text-sm font-medium"
                          >
                            <span className="flex items-center gap-2">
                              {cat.icon && <img src={cat.icon} alt="" className="w-4 h-4 object-contain opacity-70" />}
                              {cat.name}
                            </span>
                            {cat.children?.length > 0 && <ChevronLeft className="w-4 h-4 opacity-50 group-hover/item:translate-x-[-2px] transition-transform" />}
                          </Link>
                          
                          {/* زیردسته‌ها */}
                          {cat.children?.length > 0 && (
                            <div className="invisible opacity-0 group-hover/item:visible group-hover/item:opacity-100 absolute right-[calc(100%+5px)] top-0 w-64 bg-card shadow-2xl border border-border rounded-2xl transition-all duration-200 transform translate-x-2 group-hover/item:translate-x-0 p-2 z-[60]">
                              <div className="px-3 py-2 mb-1 border-b border-border/50">
                                <span className="text-[10px] font-black text-foreground-muted uppercase tracking-widest">زیرمجموعه {cat.name}</span>
                              </div>
                              {cat.children.map(sub => (
                                <Link 
                                  key={sub.id} 
                                  href={`/category/${sub.slug}`}
                                  className="flex items-center justify-between px-3 py-2.5 hover:bg-secondary rounded-xl transition-colors text-sm font-medium"
                                >
                                  {sub.name}
                                  <ChevronLeft className="w-3 h-3 opacity-30" />
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

            </nav>

            {/* ابزارهای کاربر */}
            <div className="flex items-center gap-1 md:gap-2 xl:gap-3 flex-shrink-0">
              <button
                onClick={() => setSearchModalOpen(true)}
                className="hidden xl:flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary-hover border border-border rounded-xl transition-all text-foreground-muted hover:text-foreground group"
              >
                <Search className="w-4 h-4 group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium">جستجو...</span>
                <kbd className="hidden xl:inline-block text-[10px] bg-card border border-border px-1.5 py-0.5 rounded-md mr-4 opacity-50">Ctrl K</kbd>
              </button>

              <button
                onClick={() => setSearchModalOpen(true)}
                className="xl:hidden p-2 md:p-2.5 hover:bg-secondary rounded-xl"
              >
                <Search className="w-5 h-5" />
              </button>

            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="p-2 md:p-2.5 hover:bg-secondary rounded-xl transition-colors text-foreground-muted"
              >
                {resolvedTheme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}

            <Link href="/cart" className="p-2 md:p-2.5 hover:bg-secondary rounded-xl relative group">
              <ShoppingCart className="w-5 h-5 text-foreground-muted group-hover:text-primary transition-colors" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center rounded-full border-2 border-card shadow-sm animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-2 xl:gap-3">
                  {isAdmin && (
                    <Link 
                      href="/admin" 
                      className="hidden lg:flex xl:flex items-center gap-2 px-3 xl:px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary hover:text-white transition-all text-xs xl:text-sm font-black"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span className="hidden xl:inline">پنل مدیریت</span>
                      <span className="xl:hidden">ادمین</span>
                    </Link>
                  )}
                <UserDropdown />
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-2 bg-primary text-primary-foreground px-3 md:px-5 py-2 md:py-2.5 rounded-xl hover:bg-primary/90 transition-all text-xs md:text-sm font-black shadow-lg shadow-primary/20 whitespace-nowrap">
                <User className="w-4 h-4" />
                ورود / ثبت‌نام
              </Link>
            )}
          </div>
        </div>
      </div>

      <SearchModal 
        isOpen={searchModalOpen} 
        onClose={() => setSearchModalOpen(false)} 
      />

      {/* موبایل منو (ریسپانسیو) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-[300px] bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-sm">M</span>
                </div>
                <span className="font-black text-lg">Markaz Tech</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-secondary rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 hover:bg-secondary rounded-2xl font-bold transition-all border border-transparent hover:border-border">
                <Home className="w-5 h-5 text-primary" />
                خانه
              </Link>
                <Link href="/search" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 hover:bg-secondary rounded-2xl font-bold transition-all border border-transparent hover:border-border">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  محصولات
                </Link>
                <Link href="/articles" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 hover:bg-secondary rounded-2xl font-bold transition-all border border-transparent hover:border-border">
                  <BookOpen className="w-5 h-5 text-primary" />
                  مقالات
                </Link>
              {user && (
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 hover:bg-secondary rounded-2xl font-bold transition-all border border-transparent hover:border-border">
                  <LayoutDashboard className="w-5 h-5 text-primary" />
                  داشبورد
                </Link>
              )}
                {isAdmin && (
                  <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 bg-primary/10 text-primary rounded-2xl font-black transition-all border border-primary/20">
                    <ShieldCheck className="w-5 h-5" />
                    مدیریت سیستم
                  </Link>
                )}

              <div className="pt-6">
                <h3 className="px-4 text-xs font-black text-foreground-muted uppercase tracking-widest mb-4">دسته‌بندی‌ها</h3>
                <div className="grid grid-cols-1 gap-1">
                  {categories.map((cat) => (
                    <Link 
                      key={cat.id} 
                      href={`/category/${cat.slug}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="px-4 py-3 hover:bg-secondary rounded-xl text-sm font-bold transition-colors flex items-center justify-between"
                    >
                      {cat.name}
                      <ChevronLeft className="w-4 h-4 opacity-30" />
                    </Link>
                  ))}
                </div>
              </div>
            </nav>

            {!user && (
              <div className="p-6 border-t border-border">
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black text-center block shadow-lg shadow-primary/20">
                  ورود یا ثبت‌نام
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
