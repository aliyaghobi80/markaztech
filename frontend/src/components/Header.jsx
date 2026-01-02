// مسیر: src/components/Header.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, ShoppingCart, User, Menu, ChevronLeft, 
  Sun, Moon, LayoutDashboard, ShieldCheck, X,
  ShoppingBag, Home, BookOpen, Sparkles
} from "lucide-react";
import api from "@/lib/axios";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import UserDropdown from "./UserDropdown";
import SearchModal from "./SearchModal";
import { getImageUrl } from "@/lib/utils";

export default function Header() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [siteSettings, setSiteSettings] = useState({
    site_name: 'مرکزتک',
    site_logo: null
  });
  const { cart } = useCart();
  const { user } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);
    const [expandedMobileCats, setExpandedMobileCats] = useState({});

    const toggleMobileCat = (id) => {
      setExpandedMobileCats(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    };


  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const isAdmin = user?.role === 'ADMIN' || user?.is_staff;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleWebSocketMessage = (data) => {
      if (data.type === 'site_settings_update') {
        setSiteSettings(prevSettings => ({ ...prevSettings, ...data.settings }));
      }
    };

    // Subscribe to WebSocket messages if available
    if (typeof window !== 'undefined' && window.globalWebSocket) {
      window.globalWebSocket.addListener('header-settings', handleWebSocketMessage);
    }

    return () => {
      if (typeof window !== 'undefined' && window.globalWebSocket) {
        window.globalWebSocket.removeListener('header-settings');
      }
    };
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/products/categories/");
        setCategories(response.data || []);
      } catch (error) {
        console.error("خطا در دریافت دسته‌بندی‌ها:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchSiteSettings = async () => {
      try {
        const response = await api.get("/users/site-settings/");
        setSiteSettings(response.data);
      } catch (error) {
        console.error("Error fetching site settings");
      }
    };

    fetchCategories();
    fetchSiteSettings();
  }, []);

  return (
    <header className={`sticky top-0 z-[9998] transition-all duration-300 ${
      scrolled 
        ? 'bg-card/95 backdrop-blur-xl shadow-lg border-b border-border py-1' 
        : 'bg-card border-b border-border py-2'
    }`}>
      <div className="container mx-auto px-3">
        <div className="flex items-center justify-between gap-2 h-14">
          
            {/* لوگو و منوی موبایل */}
            <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden p-1.5 hover:bg-secondary rounded-lg transition-colors flex-shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link href="/" className="flex items-center gap-2 min-w-0 group">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0 overflow-hidden group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  {siteSettings.site_logo_url ? (
                    <img 
                      src={siteSettings.site_logo_url} 
                      alt={siteSettings.site_name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-white font-black text-sm">M</span>
                  )}
                </div>
                <span className="text-lg font-black hidden sm:block tracking-tight whitespace-nowrap group-hover:text-primary transition-colors truncate">
                  {siteSettings.site_name || 'MarkazTech'}
                </span>
              </Link>
            </div>

            {/* نویگیشن دسکتاپ */}
            <nav className="hidden lg:flex items-center gap-1 bg-gradient-to-r from-secondary/60 to-secondary/40 backdrop-blur-sm p-1 rounded-xl border border-border/50 shadow-sm">
              <Link href="/" className="px-2 py-1.5 hover:bg-card hover:shadow-md rounded-lg transition-all text-xs font-bold flex items-center gap-1.5 whitespace-nowrap hover:scale-105 active:scale-95">
                <Home className="w-3.5 h-3.5 text-primary" />
                خانه
              </Link>
              <Link href="/about" className="px-2 py-1.5 hover:bg-card hover:shadow-md rounded-lg transition-all text-xs font-bold flex items-center gap-1.5 whitespace-nowrap hover:scale-105 active:scale-95">
                <User className="w-3.5 h-3.5 text-primary" />
                درباره ما
              </Link>
              <Link href="/articles" className="px-2 py-1.5 hover:bg-card hover:shadow-md rounded-lg transition-all text-xs font-bold flex items-center gap-1.5 whitespace-nowrap hover:scale-105 active:scale-95">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                مقالات
              </Link>
                <Link href="/products" className="px-2 py-1.5 hover:bg-card hover:shadow-md rounded-lg transition-all text-xs font-bold flex items-center gap-1.5 whitespace-nowrap hover:scale-105 active:scale-95">
                  <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                  محصولات
                </Link>
                
                    <div 
                      className="group relative z-[9999]"
                      onMouseEnter={() => {}}
                      onMouseLeave={() => setActiveCategory(null)}
                    >
                      <button className="px-2 py-1.5 hover:bg-card hover:shadow-md rounded-lg transition-all text-xs font-bold flex items-center gap-1.5 whitespace-nowrap hover:scale-105 active:scale-95">
                        <LayoutDashboard className="w-3.5 h-3.5 text-primary group-hover:rotate-12 transition-transform" />
                        دسته‌بندی‌ها
                      </button>
                      
                      {/* مگامنو دسکتاپ - نسخه ساده */}
                      <div className="absolute top-full left-0 mt-1 w-[600px] bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex max-h-80 overflow-hidden z-[9999]">
                        
                        {/* لیست دسته‌های اصلی */}
                        <div className="w-1/3 bg-secondary/50 border-l border-border p-3 overflow-y-auto">
                          {loading ? (
                            <div className="flex flex-col gap-2">
                              {[1,2,3,4].map(i => <div key={i} className="h-10 bg-secondary/50 rounded-xl animate-pulse" />)}
                            </div>
                          ) : categories && categories.length > 0 ? (
                            categories.map((cat) => (
                              <Link
                                key={cat.id}
                                href={`/category/${cat.slug}`}
                                onMouseEnter={() => setActiveCategory(cat)}
                                onClick={() => setActiveCategory(null)} // بستن مگامنو هنگام کلیک
                                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-sm font-bold cursor-pointer mb-1.5 ${
                                  activeCategory?.id === cat.id 
                                    ? 'bg-primary text-white' 
                                    : 'hover:bg-primary/10 hover:text-primary'
                                }`}
                              >
                                <span className="flex items-center gap-2.5">
                                  {cat.icon && (
                                    <img 
                                      src={cat.icon} 
                                      alt="" 
                                      className="w-5 h-5 object-contain" 
                                    />
                                  )}
                                  {cat.name}
                                </span>
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </Link>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center h-32 opacity-50">
                              <LayoutDashboard className="w-12 h-12 text-primary mb-2" />
                              <span className="text-xs font-bold text-center">هیچ دسته‌بندی یافت نشد</span>
                            </div>
                          )}
                        </div>

                        {/* محتوای زیردسته‌ها */}
                        <div className="flex-1 p-4 overflow-y-auto">
                          {activeCategory ? (
                            <div>
                              <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-3">
                                <h3 className="text-lg font-bold flex items-center gap-3">
                                  {activeCategory.icon && <img src={activeCategory.icon} alt="" className="w-6 h-6 object-contain" />}
                                  <span className="text-primary">
                                    {activeCategory.name}
                                  </span>
                                </h3>
                                <Link 
                                  href={`/category/${activeCategory.slug}`}
                                  className="text-xs font-bold text-primary hover:text-blue-600 transition-colors flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-lg hover:bg-primary/20"
                                  title={`مشاهده تمام محصولات ${activeCategory.name}`}
                                  onClick={() => setActiveCategory(null)} // بستن مگامنو هنگام کلیک
                                >
                                  مشاهده همه ({activeCategory.children?.length || 0} زیرمجموعه)
                                  <ChevronLeft className="w-3 h-3" />
                                </Link>
                              </div>
                              
                              {activeCategory.children?.length > 0 ? (
                                <div className="grid grid-cols-2 gap-2">
                                  {activeCategory.children.map(sub => (
                                    <Link 
                                      key={sub.id} 
                                      href={`/category/${sub.slug}`}
                                      className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-secondary/50 transition-all"
                                      onClick={() => setActiveCategory(null)} // بستن مگامنو هنگام کلیک
                                    >
                                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                      <span className="text-xs font-medium text-foreground-muted hover:text-foreground transition-colors">
                                        {sub.name}
                                      </span>
                                    </Link>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center h-32 opacity-50">
                                  <LayoutDashboard className="w-12 h-12 text-primary mb-2" />
                                  <span className="text-xs font-bold">زیرمجموعه‌ای یافت نشد</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                              <Sparkles className="w-16 h-16 text-primary mb-4" />
                              <p className="text-xs font-bold text-foreground-muted">
                                برای مشاهده زیرمجموعه‌ها،<br />
                                نشانگر را روی یک دسته قرار دهید
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>


            </nav>

            {/* ابزارهای کاربر */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setSearchModalOpen(true)}
                className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-secondary to-secondary/80 hover:from-primary/10 hover:to-primary/5 border border-border hover:border-primary/30 rounded-lg transition-all text-foreground-muted hover:text-foreground group shadow-sm hover:shadow-md"
              >
                <Search className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
                <span className="text-xs font-medium">جستجو در محصولات...</span>
                <kbd className="hidden xl:inline-block text-[9px] bg-card border border-border px-1 py-0.5 rounded-md mr-2 opacity-50 group-hover:opacity-70 transition-opacity">Ctrl K</kbd>
              </button>

              <button
                onClick={() => setSearchModalOpen(true)}
                className="xl:hidden p-1.5 hover:bg-secondary rounded-lg transition-all hover:scale-105 active:scale-95"
              >
                <Search className="w-4 h-4 text-foreground-muted hover:text-primary transition-colors" />
              </button>

              {mounted && (
                <button
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="p-1.5 hover:bg-secondary rounded-lg transition-all text-foreground-muted hover:text-foreground hover:scale-105 active:scale-95 group"
                  title={resolvedTheme === "dark" ? "تغییر به تم روشن" : "تغییر به تم تاریک"}
                >
                  {resolvedTheme === "dark" ? 
                    <Sun className="w-4 h-4 text-yellow-500 group-hover:text-yellow-400 transition-colors" /> : 
                    <Moon className="w-4 h-4 text-slate-600 group-hover:text-slate-500 transition-colors" />
                  }
                </button>
              )}

            <Link href="/cart" className="p-1.5 hover:bg-secondary rounded-lg relative group transition-all hover:scale-105 active:scale-95">
              <ShoppingCart className="w-4 h-4 text-foreground-muted group-hover:text-primary transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-card shadow-lg animate-in zoom-in">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-1">
                {/* دکمه مدیریت سیستم فقط برای ادمین‌ها */}
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className="hidden lg:flex items-center gap-1.5 px-2 py-1.5 bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg hover:from-emerald-500 hover:to-green-500 hover:text-white transition-all text-xs font-black shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 hover:scale-105 active:scale-95"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="hidden xl:inline">مدیریت</span>
                  </Link>
                )}
                <UserDropdown />
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-blue-600 text-white px-3 py-1.5 rounded-lg hover:from-primary/90 hover:to-blue-600/90 transition-all text-xs font-black shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95 whitespace-nowrap">
                <User className="w-3.5 h-3.5" />
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
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-[300px] bg-card/95 backdrop-blur-xl border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-secondary/30 to-secondary/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  {siteSettings.site_logo_url ? (
                    <img 
                      src={siteSettings.site_logo_url} 
                      alt={siteSettings.site_name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-white font-black text-sm">M</span>
                  )}
                </div>
                <span className="font-black text-lg bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  {siteSettings.site_name || 'MarkazTech'}
                </span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-1.5 hover:bg-secondary rounded-lg transition-all hover:scale-105">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
              <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 hover:bg-secondary rounded-xl font-bold transition-all border border-transparent hover:border-border">
                <Home className="w-4 h-4 text-primary" />
                خانه
              </Link>
              <Link href="/about" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 hover:bg-secondary rounded-xl font-bold transition-all border border-transparent hover:border-border">
                <User className="w-4 h-4 text-primary" />
                درباره ما
              </Link>
                <Link href="/products" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 hover:bg-secondary rounded-xl font-bold transition-all border border-transparent hover:border-border">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                  محصولات
                </Link>
                <Link href="/articles" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 hover:bg-secondary rounded-xl font-bold transition-all border border-transparent hover:border-border">
                  <BookOpen className="w-4 h-4 text-primary" />
                  مقالات
                </Link>
              {user && (
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 hover:bg-secondary rounded-xl font-bold transition-all border border-transparent hover:border-border">
                  <LayoutDashboard className="w-4 h-4 text-primary" />
                  داشبورد
                </Link>
              )}
                {isAdmin && (
                  <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 bg-primary/10 text-primary rounded-xl font-black transition-all border border-primary/20">
                    <ShieldCheck className="w-4 h-4" />
                    مدیریت سیستم
                  </Link>
                )}

                <div className="pt-4">
                  <h3 className="px-3 text-[9px] font-black text-foreground-muted uppercase tracking-widest mb-3">دسته‌بندی‌های هوشمند</h3>
                  <div className="px-1 space-y-1">
                    {categories.map((cat) => (
                      <div key={cat.id} className="overflow-hidden">
                        <div className="flex items-center gap-1">
                          <Link 
                            href={`/category/${cat.slug}`}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex-1 flex items-center gap-2.5 p-2.5 hover:bg-secondary rounded-xl transition-all"
                          >
                            {cat.icon && <img src={cat.icon} alt="" className="w-4 h-4 opacity-70" />}
                            <span className="font-bold text-sm">{cat.name}</span>
                          </Link>
                          {cat.children?.length > 0 && (
                            <button 
                              onClick={() => toggleMobileCat(cat.id)}
                              className={`p-2.5 rounded-xl transition-all ${expandedMobileCats[cat.id] ? 'bg-primary text-white' : 'bg-secondary/50'}`}
                            >
                              <ChevronLeft className={`w-3.5 h-3.5 transition-transform ${expandedMobileCats[cat.id] ? '-rotate-90' : ''}`} />
                            </button>
                          )}
                        </div>
                        
                        {/* زیرمجموعه‌های موبایل */}
                        {cat.children?.length > 0 && expandedMobileCats[cat.id] && (
                          <div className="mr-4 pr-3 border-r-2 border-primary/20 mt-1 mb-1.5 space-y-0.5 animate-in slide-in-from-right-2 duration-200">
                            {cat.children.map(sub => (
                              <Link 
                                key={sub.id} 
                                href={`/category/${sub.slug}`}
                                onClick={() => setIsMenuOpen(false)}
                                className="block p-2 hover:bg-secondary rounded-lg text-xs font-medium transition-colors"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

            </nav>

            {!user && (
              <div className="p-4 border-t border-border">
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-black text-center block shadow-lg shadow-primary/20">
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
