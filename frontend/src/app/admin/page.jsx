// مسیر: src/app/admin/page.jsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { DollarSign, ShoppingBag, Users, Activity } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();

  const stats = [
    { title: "فروش کل", value: "۱۲,۵۰۰,۰۰۰ تومان", icon: DollarSign, color: "bg-success" },
    { title: "سفارشات جدید", value: "+۱۵", icon: ShoppingBag, color: "bg-primary" },
    { title: "کاربران عضو", value: "۱,۲۴۰", icon: Users, color: "bg-warning" },
    { title: "بازدید امروز", value: "+۳,۰۰۰", icon: Activity, color: "bg-error" },
  ];

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