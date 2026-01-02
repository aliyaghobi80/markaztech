// مسیر: src/app/admin/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Activity, 
  Loader2, 
  Settings,
  Package,
  CreditCard,
  MessageSquare,
  Headphones,
  Wallet,
  FileText
} from "lucide-react";
import api from "@/lib/axios";
import AdminSiteSettings from "@/components/admin/AdminSiteSettings";
import AdminArticles from "@/components/admin/AdminArticles";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

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

  const stats = [
    { 
      title: "فروش کل", 
      value: data ? `${data.total_sales.toLocaleString()} تومان` : "۰ تومان", 
      icon: DollarSign, 
      color: "bg-success" 
    },
    { 
      title: "سفارشات امروز", 
      value: data ? `+${data.new_orders_today}` : "۰", 
      icon: ShoppingBag, 
      color: "bg-primary" 
    },
    { 
      title: "کل کاربران", 
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

  const menuItems = [
    { id: 'dashboard', label: 'داشبورد', icon: Activity },
    { id: 'products', label: 'محصولات', icon: Package },
    { id: 'articles', label: 'مقالات', icon: FileText },
    { id: 'orders', label: 'سفارشات', icon: CreditCard },
    { id: 'users', label: 'کاربران', icon: Users },
    { id: 'wallet-requests', label: 'درخواست‌های شارژ', icon: Wallet },
    { id: 'comments', label: 'نظرات', icon: MessageSquare },
    { id: 'tickets', label: 'تیکت‌ها', icon: Headphones },
    { id: 'settings', label: 'تنظیمات سایت', icon: Settings },
  ];

  if (loading && activeTab === 'dashboard') {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-foreground-muted animate-pulse">در حال بارگذاری آمار...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground mb-2">
            پنل مدیریت مرکزتک
          </h1>
          <p className="text-foreground-muted">
            سلام، {user?.full_name || "مدیر گرامی"} 👋 به پنل مدیریت خوش آمدید.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Menu */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-4 sticky top-24">
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      activeTab === item.id
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "text-foreground-muted hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            
            {activeTab === 'dashboard' && (
              <div>
                {/* کارت‌های آماری */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {stats.map((stat, index) => (
                    <div key={index} className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
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

                <div className="bg-primary/10 text-primary p-6 rounded-2xl border border-primary/20">
                  <h3 className="font-bold text-lg mb-2">📌 راهنمای سریع</h3>
                  <p>از منوی سمت راست می‌توانید محصولات، کاربران، سفارشات و تنظیمات سایت را مدیریت کنید. تغییرات شما به صورت آنی در سایت اعمال می‌شود.</p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && <AdminSiteSettings />}
            {activeTab === 'articles' && <AdminArticles />}

            {activeTab !== 'dashboard' && activeTab !== 'settings' && activeTab !== 'articles' && (
              <div className="bg-card border border-border rounded-2xl p-8 text-center">
                <Package className="w-16 h-16 text-foreground-muted mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-bold text-foreground mb-2">بخش {menuItems.find(item => item.id === activeTab)?.label}</h3>
                <p className="text-foreground-muted">این بخش در حال توسعه است و به زودی اضافه خواهد شد.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}