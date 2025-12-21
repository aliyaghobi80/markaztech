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
                  {[
                    { label: 'کل بازدیدها', value: stats.total_visits, color: 'text-foreground' },
                    { label: 'بازدید امروز', value: stats.today_visits, color: 'text-primary' },
                    { label: 'کاربران آنلاین', value: stats.online_users, color: 'text-green-500', isOnline: true },
                    { label: 'رضایت کاربران', value: `${stats.satisfaction_rate}%`, color: 'text-foreground' }
                  ].map((stat, i) => (
                    <div key={i} className="group relative text-center p-4 bg-card/30 backdrop-blur-md rounded-2xl border border-white/5 hover:border-primary/20 hover:bg-card/50 transition-all duration-300">
                      <div className="relative z-10">
                        <div className={`text-xl md:text-2xl font-black ${stat.color} mb-1 transition-transform group-hover:scale-110`}>
                          {stat.value?.toLocaleString() || '۰'}
                        </div>
                        <div className="text-[9px] text-foreground-muted uppercase tracking-[0.1em] font-bold">{stat.label}</div>
                      </div>
                      {stat.isOnline && (
                        <div className="absolute top-2 right-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
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
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-cyan-500/30 rounded-[2.5rem] blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    
                    <Link href={`/product/${currentProduct.slug}`} className="block relative bg-card/40 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] hover:border-primary/30 transition-all duration-500 overflow-hidden">
                      {/* Decorative elements */}
                      <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors"></div>
                      
                      <div className="flex items-center gap-4 mb-8">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary to-cyan-500 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg p-0.5">
                            <div className="w-full h-full bg-card rounded-[0.9rem] overflow-hidden">
                              {currentProduct.main_image ? (
                                <img src={currentProduct.main_image} alt={currentProduct.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center animate-pulse">
                                  <Sparkles className="w-7 h-7 text-primary" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{currentProduct.title}</h3>
                          <span className="inline-block px-2 py-0.5 mt-1 bg-primary/10 text-primary text-[10px] font-bold rounded-md uppercase tracking-wide">
                            {currentProduct.category?.name || 'اکانت پریمیوم'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 mb-8">
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                          <div className="w-8 h-8 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-yellow-500" />
                          </div>
                          <span className="text-sm text-foreground/80">بالاترین کیفیت موجود در بازار</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                          <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-green-500" />
                          </div>
                          <span className="text-sm text-foreground/80">ضمانت کامل و پشتیبانی اختصاصی</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm text-foreground/80">تحویل فوری در {currentProduct.delivery_time || 'کمتر از ۱ ساعت'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-end justify-between pt-4 border-t border-white/5">
                        <div className="space-y-1">
                          {currentProduct.discount_price && (
                            <div className="text-foreground-muted text-xs line-through opacity-60 decoration-red-500/50">{currentProduct.price.toLocaleString()} تومان</div>
                          )}
                          <div className="text-2xl font-black text-foreground flex items-center gap-1">
                            {(currentProduct.discount_price || currentProduct.price).toLocaleString()}
                            <span className="text-xs font-medium opacity-70">تومان</span>
                          </div>
                        </div>
                        
                        {currentProduct.discount_price ? (
                          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg shadow-red-500/20">
                            {Math.round((1 - currentProduct.discount_price / currentProduct.price) * 100)}٪ تخفیف ویژه
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                            <ArrowLeft className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </Link>
  
                    <div className="absolute -top-3 -right-3 bg-card/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                      <div className="flex items-center gap-2">
                        <span className={`relative flex h-2 w-2`}>
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${currentProduct.stock > 0 ? 'bg-green-400' : 'bg-red-400'} opacity-75`}></span>
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${currentProduct.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        </span>
                          <span className="text-foreground text-xs font-bold">
                            {currentProduct.stock > 0 ? `${currentProduct.stock} عدد آماده تحویل` : 'اتمام موجودی'}
                          </span>
                      </div>
                    </div>
                  </motion.div>
              ) : (
                <div className="w-80 h-[300px] bg-card/20 animate-pulse rounded-3xl border border-border"></div>
              )}
            </AnimatePresence>

              {heroProducts.length > 1 && (
                <div className="flex justify-center gap-6 mt-10">
                  <button 
                    onClick={prevSlide} 
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-card/50 backdrop-blur-xl border border-white/10 hover:border-primary/50 hover:bg-card/80 transition-all shadow-lg active:scale-95 group"
                  >
                    <ChevronRight className="w-6 h-6 text-foreground/70 group-hover:text-primary transition-colors" />
                  </button>
                  
                  <div className="flex items-center gap-3">
                    {heroProducts.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setDirection(i > currentIndex ? 1 : -1);
                          setCurrentIndex(i);
                        }}
                        className={`transition-all duration-300 rounded-full ${
                          i === currentIndex 
                            ? 'w-10 h-2 bg-gradient-to-r from-primary to-cyan-500' 
                            : 'w-2 h-2 bg-border hover:bg-primary/30'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <button 
                    onClick={nextSlide} 
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-card/50 backdrop-blur-xl border border-white/10 hover:border-primary/50 hover:bg-card/80 transition-all shadow-lg active:scale-95 group"
                  >
                    <ChevronLeft className="w-6 h-6 text-foreground/70 group-hover:text-primary transition-colors" />
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
