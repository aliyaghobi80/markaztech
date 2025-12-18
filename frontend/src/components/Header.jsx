"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingCart, User, Menu, ChevronLeft, Sun, Moon, Home, Grid3X3, LayoutDashboard, X, ChevronDown } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const { cart } = useCart();
  const { user } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileCategoriesOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-card/95 backdrop-blur-xl shadow-lg border-b border-border' : 'bg-card border-b border-border'}`}>
      <div className="container mx-auto px-4">
        <div className="h-16 md:h-18 flex items-center justify-between gap-4">

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2.5 hover:bg-secondary rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5 text-foreground-muted" />
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

            {user && (
              <Link href="/dashboard" className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl hover:from-primary/20 hover:to-primary/10 transition-all">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="text-xs font-bold text-primary whitespace-nowrap">
                  {new Intl.NumberFormat('fa-IR').format(user.wallet_balance || 0)} ت
                </span>
              </Link>
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
              <UserDropdown />
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

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          
          <div className="fixed inset-y-0 right-0 w-80 max-w-full bg-card shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <Link href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <span className="text-white font-black text-sm">M</span>
                  </div>
                  <span className="text-xl font-black">
                    <span className="text-primary">Markaz</span>
                    <span className="text-foreground">Tech</span>
                  </span>
                </Link>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 hover:bg-secondary rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-foreground-muted" />
                </button>
              </div>

              {user && (
                <div className="p-4 border-b border-border bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground truncate">{user.full_name || user.mobile}</p>
                      <div className="flex items-center gap-1 text-sm text-foreground-muted">
                        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span className="font-bold text-primary">
                          {new Intl.NumberFormat('fa-IR').format(user.wallet_balance || 0)} تومان
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <nav className="flex-1 overflow-y-auto py-4">
                <div className="space-y-1 px-3">
                  <Link 
                    href="/" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-xl transition-all font-medium"
                  >
                    <Home className="w-5 h-5 text-foreground-muted" />
                    خانه
                  </Link>
                  
                  <Link 
                    href="/search" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-xl transition-all font-medium"
                  >
                    <Grid3X3 className="w-5 h-5 text-foreground-muted" />
                    محصولات
                  </Link>

                  {user && (
                    <Link 
                      href="/dashboard" 
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-xl transition-all font-medium"
                    >
                      <LayoutDashboard className="w-5 h-5 text-foreground-muted" />
                      داشبورد
                    </Link>
                  )}

                  <div>
                    <button
                      onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                      className="flex items-center justify-between w-full px-4 py-3 text-foreground hover:bg-secondary rounded-xl transition-all font-medium"
                    >
                      <div className="flex items-center gap-3">
                        <Menu className="w-5 h-5 text-foreground-muted" />
                        دسته‌بندی‌ها
                      </div>
                      <ChevronDown className={`w-4 h-4 text-foreground-muted transition-transform ${mobileCategoriesOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {mobileCategoriesOpen && (
                      <div className="mt-1 mr-4 pr-4 border-r-2 border-border space-y-1">
                        {loading ? (
                          <p className="px-4 py-2 text-sm text-foreground-muted">در حال بارگذاری...</p>
                        ) : categories.length > 0 ? (
                          categories.map((cat) => (
                            <div key={cat.id}>
                              <Link
                                href={`/category/${cat.slug}`}
                                onClick={closeMobileMenu}
                                className="block px-4 py-2.5 text-foreground-secondary hover:text-primary hover:bg-secondary/50 rounded-lg transition-all text-sm font-medium"
                              >
                                {cat.name}
                              </Link>
                              {cat.children && cat.children.length > 0 && (
                                <div className="mr-4 space-y-1">
                                  {cat.children.map((child) => (
                                    <Link
                                      key={child.id}
                                      href={`/category/${child.slug}`}
                                      onClick={closeMobileMenu}
                                      className="block px-4 py-2 text-foreground-muted hover:text-primary text-xs transition-colors"
                                    >
                                      {child.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="px-4 py-2 text-sm text-foreground-muted">دسته‌ای یافت نشد</p>
                        )}
                      </div>
                    )}
                  </div>

                  <Link 
                    href="/cart" 
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between px-4 py-3 text-foreground hover:bg-secondary rounded-xl transition-all font-medium"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="w-5 h-5 text-foreground-muted" />
                      سبد خرید
                    </div>
                    {cartCount > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>
              </nav>

              <div className="p-4 border-t border-border space-y-3">
                {!user && (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-center gap-2 px-4 py-3 border border-border rounded-xl hover:border-primary hover:text-primary text-foreground-muted transition-all font-medium"
                    >
                      ورود
                    </Link>
                    <Link
                      href="/register"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl hover:bg-primary/90 transition-all font-medium"
                    >
                      ثبت‌نام
                    </Link>
                  </div>
                )}
                
                {user && (
                  <Link
                    href="/profile"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-border rounded-xl hover:border-primary hover:text-primary text-foreground-muted transition-all font-medium"
                  >
                    <User className="w-5 h-5" />
                    ویرایش پروفایل
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <SearchModal 
        isOpen={searchModalOpen} 
        onClose={() => setSearchModalOpen(false)} 
      />
    </header>
  );
}
