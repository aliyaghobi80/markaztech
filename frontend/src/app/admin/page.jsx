// مسیر: src/app/admin/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { DollarSign, ShoppingBag, Users, Activity, Loader2 } from "lucide-react";
import api from "@/lib/axios";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/users/admin-statistics/');
        setData(res.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { 
      title: "فروش کل", 
      value: data ? `${data.total_sales.toLocaleString()} تومان` : "۰ تومان", 
      icon: DollarSign, 
      color: "bg-success" 
    },
    { 
      title: "سفارشات جدید", 
      value: data ? `+${data.pending_orders}` : "۰", 
      icon: ShoppingBag, 
      color: "bg-primary" 
    },
    { 
      title: "کاربران عضو", 
      value: data ? data.total_users.toLocaleString() : "۰", 
      icon: Users, 
      color: "bg-warning" 
    },
    { 
      title: "بازدید امروز", 
      value: data ? `+${data.today_visits.toLocaleString()}` : "۰", 
      icon: Activity, 
      color: "bg-error" 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-foreground-muted animate-pulse">در حال بارگذاری آمار...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-foreground mb-2">
        سلام، {user?.full_name || "مدیر گرامی"} 👋
      </h1>
      <p className="text-foreground-muted mb-8">به پنل مدیریت مرکز تک خوش آمدید.</p>

      {/* کارت‌های آماری */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">{stat.title}</p>
              <h3 className="text-xl font-bold text-foreground mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-primary/10 text-primary p-6 rounded-3xl border border-primary/20">
        <h3 className="font-bold text-lg mb-2">📌 راهنمای سریع</h3>
        <p>از منوی سمت راست می‌توانید محصولات، کاربران و سفارشات را مدیریت کنید. تغییرات شما به صورت آنی در سایت اعمال می‌شود.</p>
      </div>
    </div>
  );
}