"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingCart, User, Menu, ChevronLeft, Sun, Moon, Home, Grid3X3, LayoutDashboard, Wallet } from "lucide-react";
import api from "@/lib/axios";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import { formatPrice } from "@/lib/utils";
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

  useEffect(() => {
    setMounted(true);

    const handleKeyboard = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    document.addEventListener("keydown", handleKeyboard);
    window.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("keydown", handleKeyboard);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/products/categories/");
        setCategories(response.data);
      } catch (error) {
        console.error("خطا در دریافت دسته‌بندی‌ها:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-card/95 backdrop-blur-xl shadow-lg border-b border-border' : 'bg-card border-b border-border'}`}>
      <div className="container mx-auto px-4">
        <div className="h-16 md:h-18 flex items-center justify-between gap-4">

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-2.5 hover:bg-secondary rounded-xl transition-colors text-foreground-muted hover:text-foreground"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-black text-sm">M</span>
              </div>
              <span className="text-xl font-black hidden sm:block">
                <span className="text-primary">Markaz</span>
                <span className="text-foreground">Tech</span>
              </span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/" className="flex items-center gap-2 px-4 py-2 text-foreground-muted hover:text-foreground hover:bg-secondary rounded-xl transition-all text-sm font-medium">
              <Home className="w-4 h-4" />
              خانه
            </Link>
            <Link href="/search" className="flex items-center gap-2 px-4 py-2 text-foreground-muted hover:text-foreground hover:bg-secondary rounded-xl transition-all text-sm font-medium">
              <Grid3X3 className="w-4 h-4" />
              محصولات
            </Link>
            {user && (
              <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-foreground-muted hover:text-foreground hover:bg-secondary rounded-xl transition-all text-sm font-medium">
                <LayoutDashboard className="w-4 h-4" />
                داشبورد
              </Link>
            )}
            
            <div className="group relative">
              <button className="flex items-center gap-2 px-4 py-2 text-foreground-muted hover:text-foreground hover:bg-secondary rounded-xl transition-all text-sm font-medium">
                <Menu className="w-4 h-4" />
                دسته‌بندی‌ها
              </button>

              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute top-full right-0 w-64 bg-card shadow-xl border border-border rounded-2xl transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50 mt-1">
                <ul className="py-2">
                  {loading ? (
                    <li className="px-4 py-2 text-sm text-foreground-muted">در حال بارگذاری...</li>
                  ) : categories.length > 0 ? (
                    categories.map((cat) => (
                      <li key={cat.id} className="group/sub relative">
                        <Link href={`/category/${cat.slug}`} className="flex items-center justify-between px-4 py-3 hover:bg-secondary text-foreground hover:text-primary text-sm font-medium transition-colors rounded-lg mx-2">
                          <span>{cat.name}</span>
                          {cat.children && cat.children.length > 0 && <ChevronLeft className="w-4 h-4 text-foreground-muted" />}
                        </Link>
                        {cat.children && cat.children.length > 0 && (
                          <div className="invisible opacity-0 group-hover/sub:visible group-hover/sub:opacity-100 absolute top-0 right-full w-56 bg-card shadow-xl border border-border rounded-2xl mr-2 transition-all">
                            <ul className="py-2">
                              {cat.children.map((child) => (
                                <li key={child.id}>
                                  <Link href={`/category/${child.slug}`} className="block px-4 py-2.5 hover:bg-secondary text-foreground-secondary hover:text-primary text-sm transition-colors rounded-lg mx-2">
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
          </nav>

          <div className="hidden md:flex flex-1 max-w-md relative">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="w-full bg-secondary/70 border border-border text-foreground-muted rounded-xl py-2.5 px-4 text-right hover:border-primary/50 hover:bg-secondary transition-all flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span>جستجو...</span>
              </div>
              <div className="flex items-center gap-1 text-xs bg-background px-2 py-1 rounded-md border border-border">
                <span>Ctrl</span>
                <span>+</span>
                <span>K</span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="md:hidden p-2.5 hover:bg-secondary rounded-xl transition-colors"
            >
              <Search className="w-5 h-5 text-foreground-muted" />
            </button>

            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="p-2.5 hover:bg-secondary rounded-xl transition-colors text-foreground-muted hover:text-foreground relative w-10 h-10 flex items-center justify-center"
              >
                <Sun className="h-5 w-5 absolute transition-all duration-300 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
                <Moon className="h-5 w-5 absolute transition-all duration-300 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
              </button>
            )}

            <Link href="/cart" className="p-2.5 hover:bg-secondary rounded-xl transition-colors relative">
              <ShoppingCart className="w-5 h-5 text-foreground-muted hover:text-foreground transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center rounded-full border-2 border-card">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="hidden md:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl hover:from-primary/20 hover:to-primary/10 transition-all group"
                >
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-primary">{formatPrice(user.wallet_balance || 0)}</span>
                  <span className="text-xs text-primary/70">تومان</span>
                </Link>
                <UserDropdown />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="hidden sm:flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl hover:border-primary hover:text-primary text-foreground-muted transition-all text-sm font-medium">
                  ورود
                </Link>
                <Link href="/register" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-all text-sm font-medium shadow-md shadow-primary/20">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:block">ثبت‌نام</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <SearchModal 
        isOpen={searchModalOpen} 
        onClose={() => setSearchModalOpen(false)} 
      />

      {/* موبایل منو */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* بک‌دراپ */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* محتوای منو */}
          <div className="absolute top-0 right-0 bottom-0 w-[280px] bg-card border-l border-border shadow-2xl flex flex-col transform transition-transform duration-300">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="font-black text-primary">Markaz Tech</span>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              <Link 
                href="/" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-xl font-medium transition-all"
              >
                <Home className="w-5 h-5 text-foreground-muted" />
                خانه
              </Link>
              <Link 
                href="/search" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-xl font-medium transition-all"
              >
                <Grid3X3 className="w-5 h-5 text-foreground-muted" />
                محصولات
              </Link>
              {user && (
                <Link 
                  href="/dashboard" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-xl font-medium transition-all"
                >
                  <LayoutDashboard className="w-5 h-5 text-foreground-muted" />
                  داشبورد
                </Link>
              )}

              <div className="pt-4 mt-4 border-t border-border">
                <h3 className="px-4 text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2">دسته‌بندی‌ها</h3>
                {categories.map((cat) => (
                  <div key={cat.id} className="space-y-1">
                    <Link 
                      href={`/category/${cat.slug}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-foreground hover:text-primary transition-colors font-medium text-sm"
                    >
                      {cat.name}
                    </Link>
                    {cat.children && cat.children.length > 0 && (
                      <div className="mr-4 space-y-1 border-r border-border pr-2">
                        {cat.children.map((child) => (
                          <Link 
                            key={child.id}
                            href={`/category/${child.slug}`}
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-foreground-secondary hover:text-primary transition-colors"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </nav>

            {user && (
              <div className="p-4 border-t border-border bg-secondary/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    {user.first_name?.[0] || user.username?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{user.first_name || user.username}</p>
                    <p className="text-xs text-foreground-muted">{formatPrice(user.wallet_balance || 0)} تومان</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
