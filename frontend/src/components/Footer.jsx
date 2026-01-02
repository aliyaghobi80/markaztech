"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Instagram, Send, Shield, Clock, HeadphonesIcon, Users, Eye, Youtube } from "lucide-react";
import { useGlobalWebSocket } from "@/lib/globalWebSocket";
import api from "@/lib/axios";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const persianYear = currentYear - 621;
  const [stats, setStats] = useState({
    total_visits: 0,
    online_users: 0,
    satisfaction_rate: 100
  });

  // استفاده از WebSocket مرکزی
  const handleWebSocketMessage = useCallback((data) => {
    if (data.type === 'stats_update') {
      setStats(prevStats => ({ ...prevStats, ...data.stats }));
    }
  }, []);

  useGlobalWebSocket('footer', handleWebSocketMessage);
  
  // Fetch initial stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/users/site-stats/");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching footer stats");
      }
    };
    fetchStats();
  }, []);
  
  return (
    <footer className="bg-card border-t border-border relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-card/50 dark:from-slate-900 dark:to-slate-950"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <span className="text-3xl font-black">
                <span className="text-primary">Markaz</span>
                <span className="text-foreground">Tech</span>
              </span>
            </Link>
            <p className="text-foreground-muted text-sm leading-relaxed mb-6">
              مرکز تخصصی فروش اکانت‌های پریمیوم هوش مصنوعی و نرم‌افزارهای دیجیتال با ضمانت اصالت و پشتیبانی ۲۴ ساعته
            </p>
            <div className="flex items-center gap-3">
              <a href="https://t.me/markaztech" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-secondary hover:bg-blue-500 text-foreground-muted hover:text-white rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95" title="کانال تلگرام">
                <Send className="w-5 h-5" />
              </a>
              <a href="https://instagram.com/markaztech_official" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-secondary hover:bg-pink-600 text-foreground-muted hover:text-white rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95" title="اینستاگرام">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.youtube.com/@markaztech-2000" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-secondary hover:bg-red-600 text-foreground-muted hover:text-white rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95" title="یوتوب">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-foreground font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-sm"></span>
              آمار سایت
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-secondary/50 p-3 rounded-xl border border-border/50">
                <div className="w-8 h-8 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-foreground-muted">کل بازدیدها</span>
                  <span className="text-sm font-bold text-foreground">{stats.total_visits.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-secondary/50 p-3 rounded-xl border border-border/50">
                <div className="w-8 h-8 bg-green-500/10 text-green-500 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-foreground-muted">افراد آنلاین</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-sm font-bold text-foreground">{stats.online_users} نفر</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-foreground font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-sm"></span>
              لینک‌های مفید
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-foreground-muted hover:text-foreground transition-colors text-sm">
                  درباره ما
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-foreground-muted hover:text-foreground transition-colors text-sm">
                  محصولات
                </Link>
              </li>
              <li>
                <Link href="/articles" className="text-foreground-muted hover:text-foreground transition-colors text-sm">
                  مقالات
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-foreground-muted hover:text-foreground transition-colors text-sm">
                  داشبورد
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-sm"></span>
              چرا مرکزتک؟
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-foreground-muted text-sm">
                <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>ضمانت اصالت کالا</span>
              </li>
              <li className="flex items-center gap-3 text-foreground-muted text-sm">
                <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                <span>تحویل آنی و خودکار</span>
              </li>
              <li className="flex items-center gap-3 text-foreground-muted text-sm">
                <HeadphonesIcon className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <span>پشتیبانی ۲۴/۷</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-sm"></span>
              شبکه‌های اجتماعی
            </h4>
            <div className="space-y-3">
              <a href="https://t.me/markaztech" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-foreground-muted hover:text-blue-500 transition-colors text-sm group">
                <div className="w-8 h-8 bg-secondary group-hover:bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 transition-all">
                  <Send className="w-4 h-4 group-hover:text-white" />
                </div>
                <span>کانال تلگرام</span>
              </a>
              <a href="https://instagram.com/markaztech_official" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-foreground-muted hover:text-pink-500 transition-colors text-sm group">
                <div className="w-8 h-8 bg-secondary group-hover:bg-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 transition-all">
                  <Instagram className="w-4 h-4 group-hover:text-white" />
                </div>
                <span>اینستاگرام</span>
              </a>
              <a href="https://www.youtube.com/@markaztech-2000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-foreground-muted hover:text-red-500 transition-colors text-sm group">
                <div className="w-8 h-8 bg-secondary group-hover:bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0 transition-all">
                  <Youtube className="w-4 h-4 group-hover:text-white" />
                </div>
                <span>کانال یوتوب</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-foreground font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-sm"></span>
              راه‌های ارتباطی
            </h4>
            <ul className="space-y-4">
              <li>
                <a href="mailto:info@markaztech.ir" className="flex items-center gap-3 text-foreground-muted hover:text-foreground transition-colors text-sm">
                  <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span dir="ltr">info@markaztech.ir</span>
                </a>
              </li>
              <li>
                <a href="tel:+989174320243" className="flex items-center gap-3 text-foreground-muted hover:text-foreground transition-colors text-sm">
                  <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span dir="ltr">0917 432 0243</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-foreground-muted text-sm">
                <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>ایران، شیراز</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-foreground-muted text-sm text-center md:text-right">
            تمامی حقوق این وبسایت متعلق به <span className="text-foreground font-medium">مرکزتک</span> می‌باشد. © {persianYear}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-foreground-muted/50 text-xs">markaztech.ir</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
