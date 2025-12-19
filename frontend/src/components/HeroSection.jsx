// مسیر: src/components/HeroSection.jsx
"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Zap, Shield, Clock, ChevronRight, ChevronLeft } from "lucide-react";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";

export default function HeroSection() {
    const [stats, setStats] = useState({
      total_visits: 0,
      today_visits: 0,
      online_users: 0,
      total_satisfied_customers: 0,
      satisfaction_rate: 100
    });

  const [heroProducts, setHeroProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const fetchHeroProducts = async () => {
    try {
      const response = await api.get("/products/hero_products/");
      setHeroProducts(response.data);
    } catch (error) {
      console.error("Error fetching hero products");
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/users/site-stats/");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching hero stats");
      }
    };
    fetchStats();
    fetchHeroProducts();

    // Use WebSocket for real-time stats
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/user/`;
    const socket = new WebSocket(wsUrl);
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "stats_update") {
        setStats(prev => ({ ...prev, ...data.stats }));
      }
    };
    return () => socket.close();
  }, []);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % heroProducts.length);
  }, [heroProducts.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + heroProducts.length) % heroProducts.length);
  }, [heroProducts.length]);

  useEffect(() => {
    if (heroProducts.length > 1) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [heroProducts.length, nextSlide]);

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.8
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      scale: 0.8
    })
  };

  const currentProduct = heroProducts[currentIndex];

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6bTAgMTV2Nmg2di02aC02em0wIDE1djZoNnYtNmgtNnptMTUgMHY2aDZ2LTZoLTZ6bTAtMTV2Nmg2di02aC02em0wLTE1djZoNnYtNmgtNnptLTMwIDMwdjZoNnYtNmgtNnptMC0xNXY2aDZ2LTZoLTZ6bTAtMTV2Nmg2di02aC02em0xNSAzMHY2aDZ2LTZoLTZ6bTAtMTV2Nmg2di02aC02em0wLTE1djZoNnYtNmgtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6bTAgMTV2Nmg2di02aC02em0wIDE1djZoNnYtNmgtNnptMTUgMHY2aDZ2LTZoLTZ6bTAtMTV2Nmg2di02aC02em0wLTE1djZoNnYtNmgtNnptLTMwIDMwdjZoNnYtNmgtNnptMC0xNXY2aDZ2LTZoLTZ6bTAtMTV2Nmg2di02aC02em0xNSAzMHY2aDZ2LTZoLTZ6bTAtMTV2Nmg2di02aC02em0wLTE1djZoNnYtNmgtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
      
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          
          <div className="text-center lg:text-right max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">پلتفرم شماره ۱ فروش اکانت‌های پریمیوم</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight">
              دروازه شما به دنیای
              <span className="block bg-gradient-to-l from-primary via-cyan-500 to-primary bg-clip-text text-transparent">
                هوش مصنوعی
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-foreground-muted mb-8 leading-relaxed">
              دسترسی فوری به ChatGPT Plus، Midjourney، Claude Pro و صدها سرویس پریمیوم دیگر با قیمت‌های رقابتی و پشتیبانی ۲۴ ساعته
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-10">
              <Link
                href="/search"
                className="group px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 hover:shadow-primary/40 flex items-center gap-2"
              >
                مشاهده محصولات
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <div className="flex items-center gap-2 text-foreground-muted text-sm font-medium">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                تحویل آنی و خودکار
              </div>
            </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto lg:mx-0">
                <div className="text-center p-4 bg-card/50 backdrop-blur rounded-2xl border border-border">
                  <div className="text-xl md:text-2xl font-black text-foreground">
                    {stats.total_visits?.toLocaleString() || '۰'}
                  </div>
                  <div className="text-[10px] text-foreground-muted uppercase tracking-wider">کل بازدیدها</div>
                </div>
                <div className="text-center p-4 bg-card/50 backdrop-blur rounded-2xl border border-border">
                  <div className="text-xl md:text-2xl font-black text-primary">
                    {stats.today_visits?.toLocaleString() || '۰'}
                  </div>
                  <div className="text-[10px] text-foreground-muted uppercase tracking-wider">بازدید امروز</div>
                </div>
                <div className="text-center p-4 bg-card/50 backdrop-blur rounded-2xl border border-border relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  </div>
                  <div className="text-xl md:text-2xl font-black text-green-500">
                    {stats.online_users?.toLocaleString() || '۰'}
                  </div>
                  <div className="text-[10px] text-foreground-muted uppercase tracking-wider">کاربران آنلاین</div>
                </div>
                <div className="text-center p-4 bg-card/50 backdrop-blur rounded-2xl border border-border">
                  <div className="text-xl md:text-2xl font-black text-foreground">
                    {stats.satisfaction_rate}%
                  </div>
                  <div className="text-[10px] text-foreground-muted uppercase tracking-wider">رضایت کاربران</div>
                </div>
              </div>

          </div>

          <div className="hidden lg:block relative w-[400px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              {currentProduct ? (
                <motion.div
                  key={currentProduct.id}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-cyan-500/20 rounded-3xl blur-2xl"></div>
                  
                  <Link href={`/product/${currentProduct.slug}`} className="block relative bg-card/80 backdrop-blur-xl border border-border p-8 rounded-3xl shadow-2xl hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-cyan-500 rounded-xl flex items-center justify-center overflow-hidden">
                        {currentProduct.main_image ? (
                          <img src={currentProduct.main_image} alt={currentProduct.title} className="w-full h-full object-cover" />
                        ) : (
                          <Sparkles className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="text-foreground font-bold">{currentProduct.title}</div>
                        <div className="text-foreground-muted text-sm">{currentProduct.category?.name || 'اکانت پریمیوم'}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-foreground-secondary text-sm">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span>بالاترین کیفیت موجود</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground-secondary text-sm">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span>ضمانت کامل</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground-secondary text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>تحویل در {currentProduct.delivery_time || 'کمتر از ۱ ساعت'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        {currentProduct.discount_price && (
                          <div className="text-foreground-muted text-xs line-through">{currentProduct.price.toLocaleString()} تومان</div>
                        )}
                        <div className="text-foreground text-xl font-black">
                          {(currentProduct.discount_price || currentProduct.price).toLocaleString()} تومان
                        </div>
                      </div>
                      {currentProduct.discount_price && (
                        <div className="bg-red-500/10 text-red-500 text-xs font-bold px-3 py-1 rounded-full">
                          {Math.round((1 - currentProduct.discount_price / currentProduct.price) * 100)}٪ تخفیف
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="absolute -top-4 -right-4 bg-card/90 backdrop-blur border border-border px-4 py-2 rounded-xl shadow-lg animate-bounce">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-foreground text-sm font-medium">
                        {currentProduct.stock > 0 ? 'موجود در انبار' : 'اتمام موجودی'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="w-80 h-[300px] bg-card/20 animate-pulse rounded-3xl border border-border"></div>
              )}
            </AnimatePresence>

            {heroProducts.length > 1 && (
              <div className="flex justify-center gap-4 mt-8">
                <button onClick={prevSlide} className="p-2 rounded-full bg-card border border-border hover:border-primary transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  {heroProducts.map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-primary w-4' : 'bg-border'}`} />
                  ))}
                </div>
                <button onClick={nextSlide} className="p-2 rounded-full bg-card border border-border hover:border-primary transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
    </section>
  );
}
