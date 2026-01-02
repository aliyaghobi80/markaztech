// مسیر: src/components/HeroSection.jsx
"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import api from "@/lib/axios";
import { useGlobalWebSocket } from "@/lib/globalWebSocket";
import { getImageUrl } from "@/lib/utils";

export default function HeroSection() {
    const [stats, setStats] = useState({
      total_visits: 0,
      today_visits: 0,
      online_users: 0,
      total_satisfied_customers: 0,
      satisfaction_rate: 100
    });

    const [siteSettings, setSiteSettings] = useState({
      site_name: 'مرکزتک',
      hero_logo: null,
      site_description: 'پلتفرم شماره ۱ فروش اکانت‌های پریمیوم'
    });

  // استفاده از WebSocket مرکزی
  const handleWebSocketMessage = useCallback((data) => {
    if (data.type === 'stats_update') {
      setStats(prevStats => ({ ...prevStats, ...data.stats }));
    } else if (data.type === 'site_settings_update') {
      setSiteSettings(prevSettings => ({ ...prevSettings, ...data.settings }));
    }
  }, []);

  useGlobalWebSocket('hero-section', handleWebSocketMessage);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/users/site-stats/");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching hero stats");
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

    fetchStats();
    fetchSiteSettings();
  }, []);

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
                href="/products"
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

          <div className="hidden lg:block relative w-full max-w-2xl">
            {/* Simple Logo Section */}
            <div className="flex items-center justify-center">
              <div className="relative group">
                <div className="w-80 h-80 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-105">
                  
                  {/* Background glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  
                  <div className="relative z-10 text-center">
                    {/* Main Logo */}
                    <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-3xl flex items-center justify-center mb-6 mx-auto border border-border shadow-lg group-hover:shadow-xl transition-all overflow-hidden">
                      {siteSettings.hero_logo_url ? (
                        <img 
                          src={siteSettings.hero_logo_url} 
                          alt={siteSettings.site_name}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                        />
                      ) : (
                        <Sparkles className="w-16 h-16 text-primary group-hover:scale-110 transition-transform" />
                      )}
                    </div>
                    
                    <h3 className="text-3xl font-black text-foreground mb-3 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                      {siteSettings.site_name}
                    </h3>
                    <p className="text-foreground-muted text-lg leading-relaxed">
                      {siteSettings.site_description || 'پلتفرم شماره ۱ فروش اکانت‌های پریمیوم'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
    </section>
  );
}