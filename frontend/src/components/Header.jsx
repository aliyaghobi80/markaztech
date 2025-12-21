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
                
                    <div 
                      className="group/mega relative py-2"
                      onMouseLeave={() => setActiveCategory(null)}
                    >
                      <button className="px-2 xl:px-3 py-2 hover:bg-card hover:shadow-sm rounded-xl transition-all text-xs xl:text-sm font-bold flex items-center gap-2 whitespace-nowrap">
                        <LayoutDashboard className="w-4 h-4 text-primary" />
                        دسته‌بندی‌ها
                      </button>
                      
                      {/* مگامنو دسکتاپ */}
                      <div className="invisible opacity-0 group-hover/mega:visible group-hover/mega:opacity-100 absolute top-full right-0 mt-1 w-[600px] bg-card/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 rounded-3xl transition-all duration-300 transform translate-y-4 group-hover/mega:translate-y-0 z-[100] overflow-hidden flex h-[400px]">
                        
                        {/* لیست دسته‌های اصلی */}
                        <div className="w-1/3 bg-secondary/30 border-l border-border/50 p-3 overflow-y-auto custom-scrollbar">
                          {loading ? (
                            <div className="flex flex-col gap-2">
                              {[1,2,3,4].map(i => <div key={i} className="h-10 bg-secondary/50 rounded-xl animate-pulse" />)}
                            </div>
                          ) : (
                            categories.map((cat) => (
                              <div
                                key={cat.id}
                                onMouseEnter={() => setActiveCategory(cat)}
                                className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all text-sm font-bold cursor-pointer mb-1 ${
                                  activeCategory?.id === cat.id 
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                                    : 'hover:bg-primary/10 hover:text-primary'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  {cat.icon && (
                                    <img 
                                      src={cat.icon} 
                                      alt="" 
                                      className={`w-5 h-5 object-contain transition-all ${activeCategory?.id === cat.id ? 'brightness-0 invert' : 'opacity-70 group-hover:opacity-100'}`} 
                                    />
                                  )}
                                  {cat.name}
                                </span>
                                <ChevronLeft className={`w-4 h-4 transition-transform ${activeCategory?.id === cat.id ? 'translate-x-[-4px]' : 'opacity-30'}`} />
                              </div>
                            ))
                          )}
                        </div>

                        {/* محتوای زیردسته‌ها یا بنر تبلیغاتی */}
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                          {activeCategory ? (
                            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                              <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-4">
                                <h3 className="text-lg font-black flex items-center gap-3">
                                  {activeCategory.icon && <img src={activeCategory.icon} alt="" className="w-6 h-6 object-contain" />}
                                  {activeCategory.name}
                                </h3>
                                <Link 
                                  href={`/category/${activeCategory.slug}`}
                                  className="text-xs font-black text-primary hover:underline flex items-center gap-1"
                                >
                                  مشاهده همه محصولات
                                  <ChevronLeft className="w-3 h-3" />
                                </Link>
                              </div>
                              
                              {activeCategory.children?.length > 0 ? (
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                  {activeCategory.children.map(sub => (
                                    <Link 
                                      key={sub.id} 
                                      href={`/category/${sub.slug}`}
                                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary transition-colors group/sub"
                                    >
                                      <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover/sub:bg-primary transition-colors" />
                                      <span className="text-sm font-semibold text-foreground-muted group-hover/sub:text-foreground">
                                        {sub.name}
                                      </span>
                                    </Link>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center h-48 opacity-20">
                                  <LayoutDashboard className="w-16 h-16 mb-2" />
                                  <span className="text-sm font-bold">زیرمجموعه‌ای یافت نشد</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-4">
                                <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                              </div>
                              <p className="text-sm font-bold leading-relaxed">
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
                  {resolvedTheme === "dark" ? <Sparkles className="w-5 h-5 text-yellow-400" /> : <Sun className="w-5 h-5" />}
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
                      <Link 
                        href="/admin" 
                        className="hidden lg:flex xl:flex items-center gap-2 px-3 xl:px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary hover:text-white transition-all text-xs xl:text-sm font-black"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="hidden xl:inline">مدیریت سیستم</span>
                        <span className="xl:hidden">ادمین</span>
                      </Link>
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
                  <h3 className="px-4 text-[10px] font-black text-foreground-muted uppercase tracking-widest mb-4">دسته‌بندی‌های هوشمند</h3>
                  <div className="px-2 space-y-1">
                    {categories.map((cat) => (
                      <div key={cat.id} className="overflow-hidden">
                        <div className="flex items-center gap-1">
                          <Link 
                            href={`/category/${cat.slug}`}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex-1 flex items-center gap-3 p-3.5 hover:bg-secondary rounded-2xl transition-all"
                          >
                            {cat.icon && <img src={cat.icon} alt="" className="w-5 h-5 opacity-70" />}
                            <span className="font-bold text-sm">{cat.name}</span>
                          </Link>
                          {cat.children?.length > 0 && (
                            <button 
                              onClick={() => toggleMobileCat(cat.id)}
                              className={`p-3.5 rounded-2xl transition-all ${expandedMobileCats[cat.id] ? 'bg-primary text-white' : 'bg-secondary/50'}`}
                            >
                              <ChevronLeft className={`w-4 h-4 transition-transform ${expandedMobileCats[cat.id] ? '-rotate-90' : ''}`} />
                            </button>
                          )}
                        </div>
                        
                        {/* زیرمجموعه‌های موبایل */}
                        {cat.children?.length > 0 && expandedMobileCats[cat.id] && (
                          <div className="mr-6 pr-4 border-r-2 border-primary/20 mt-1 mb-2 space-y-1 animate-in slide-in-from-right-2 duration-200">
                            {cat.children.map(sub => (
                              <Link 
                                key={sub.id} 
                                href={`/category/${sub.slug}`}
                                onClick={() => setIsMenuOpen(false)}
                                className="block p-3 hover:bg-secondary rounded-xl text-sm font-medium transition-colors"
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
