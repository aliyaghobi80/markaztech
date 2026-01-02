"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { DollarSign, ShoppingBag, Users, Activity, Loader2, Package, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import api from "@/lib/axios";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/users/admin/statistics/');
        setData(res.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl lg:text-3xl font-black text-foreground flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-primary to-blue-600 rounded-full"></div>
            پیشخوان مدیریت
          </h1>
        </div>
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-foreground-muted animate-pulse">در حال بارگذاری آمار...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      title: "فروش کل", 
      value: data ? formatPrice(data.total_sales || 0) : "۰", 
      unit: "تومان",
      icon: DollarSign, 
      gradient: "from-green-500 to-emerald-600",
      bg: "from-green-500/10 to-emerald-500/10",
      border: "border-green-500/20"
    },
    { 
      title: "کل سفارشات", 
      value: data ? (data.total_orders || 0).toLocaleString('fa-IR') : "۰", 
      unit: "سفارش",
      icon: ShoppingBag, 
      gradient: "from-primary to-blue-600",
      bg: "from-primary/10 to-blue-500/10",
      border: "border-primary/20"
    },
    { 
      title: "کل کاربران", 
      value: data ? (data.total_users || 0).toLocaleString('fa-IR') : "۰", 
      unit: "کاربر",
      icon: Users, 
      gradient: "from-purple-500 to-pink-600",
      bg: "from-purple-500/10 to-pink-500/10",
      border: "border-purple-500/20"
    },
    { 
      title: "محصولات فعال", 
      value: data ? (data.total_products || 0).toLocaleString('fa-IR') : "۰", 
      unit: "محصول",
      icon: Package, 
      gradient: "from-orange-500 to-red-600",
      bg: "from-orange-500/10 to-red-500/10",
      border: "border-orange-500/20"
    },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl lg:text-3xl font-black text-foreground flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-primary to-blue-600 rounded-full"></div>
          پیشخوان مدیریت
        </h1>
      </div>

      {/* پیام خوش‌آمدگویی */}
      <div className="bg-gradient-to-r from-card via-card to-card/80 backdrop-blur-xl border border-border rounded-3xl p-6 lg:p-8 mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-blue-500/5"></div>
        <div className="relative z-10">
          <h2 className="text-xl lg:text-2xl font-black text-foreground mb-2">
            سلام، {user?.full_name || "مدیر گرامی"} 👋
          </h2>
          <p className="text-foreground-muted">به پیشخوان مدیریت مرکز تک خوش آمدید. از اینجا می‌توانید کل سیستم را مدیریت کنید.</p>
        </div>
      </div>

      {/* کارت‌های آماری */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm border ${stat.border} rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all group hover:scale-105`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.bg} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                <stat.icon className={`w-7 h-7 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground-muted font-medium mb-1">{stat.title}</p>
                <div className="flex items-baseline gap-1">
                  <p className={`text-xl lg:text-2xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                  <span className="text-xs text-foreground-muted">{stat.unit}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* راهنمای سریع */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-blue-500/10 backdrop-blur-sm border border-primary/20 rounded-3xl p-6 lg:p-8 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-2xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-black text-lg text-foreground mb-2 flex items-center gap-2">
              📌 راهنمای سریع مدیریت
            </h3>
            <p className="text-foreground-muted leading-relaxed">
              از منوی سمت راست می‌توانید محصولات، کاربران، سفارشات و سایر بخش‌های سیستم را مدیریت کنید. 
              تمام تغییرات شما به صورت آنی در سایت اعمال می‌شود و از طریق وب‌سوکت به کاربران نمایش داده می‌شود.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-xl text-xs font-bold">
                <Package className="w-3 h-3" />
                مدیریت محصولات
              </span>
              <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-600 px-3 py-1 rounded-xl text-xs font-bold">
                <Users className="w-3 h-3" />
                مدیریت کاربران
              </span>
              <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-600 px-3 py-1 rounded-xl text-xs font-bold">
                <ShoppingBag className="w-3 h-3" />
                مدیریت سفارشات
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}