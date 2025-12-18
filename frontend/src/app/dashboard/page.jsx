// مسیر: src/app/dashboard/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { getAvatarUrl } from "@/lib/avatar";
import toast from "react-hot-toast";
import { 
  User, LogOut, Wallet, ShoppingBag, 
  CreditCard, Package, Users, MessageSquare,
  Eye, Calendar, ArrowLeft, Clock, CheckCircle, XCircle
} from "lucide-react";
import Link from "next/link";

// ایمپورت کامپوننت‌های ادمین
import AdminProducts from "@/components/admin/AdminProducts";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminUsers from "@/components/admin/AdminUsers";


export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("my-orders");
  const [userOrders, setUserOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // ریدایرکت اگر لاگین نیست
  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  // گرفتن سفارش‌های کاربر
  useEffect(() => {
    if (activeTab === 'my-orders') {
        api.get("/orders/").then(res => setUserOrders(res.data)).catch(err => console.log(err));
    }
  }, [activeTab]);



  if (authLoading || !user) return <div className="text-center p-10">در حال بارگذاری...</div>;



  // 🔴 تشخیص نقش کاربر (ادمین یا کاربر عادی)
  // ما هم is_staff (استاندارد جنگو) را چک میکنیم هم role (اگر دستی ساختید)
  const isAdmin = user.is_staff || user.is_superuser || user.role === 'ADMIN';

  // لیست منوها
  const menuItems = [
    { id: "my-orders", label: "سفارش‌های من", icon: ShoppingBag, adminOnly: false },
    { id: "admin-products", label: "مدیریت محصولات", icon: Package, adminOnly: true },
    { id: "admin-orders", label: "مدیریت پرداخت‌ها", icon: CreditCard, adminOnly: true },
    { id: "admin-users", label: "مدیریت کاربران", icon: Users, adminOnly: true },
    { id: "admin-comments", label: "نظرات و تیکت‌ها", icon: MessageSquare, adminOnly: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 py-8 transition-colors duration-300">
      <div className="container mx-auto px-4">
        
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-foreground mb-2">
                  خوش آمدید، {user.full_name || "کاربر عزیز"}! 👋
                </h1>
                <p className="text-foreground-muted">
                  {isAdmin ? "پنل مدیریت سیستم مرکز تک" : "داشبورد شخصی شما در مرکز تک"}
                </p>
              </div>
              <div className="text-left">
                <div className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
                  <p className="text-xs text-primary font-medium">موجودی حساب</p>
                  <p className="text-lg font-black text-primary">{formatPrice(user.wallet_balance || 0)} تومان</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* --- سایدبار --- */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-3xl p-6 sticky top-24 shadow-theme-lg backdrop-blur-sm">
              
              {/* پروفایل */}
              <div className="text-center mb-6">
                <div className="relative group">
                  <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3 text-primary overflow-hidden border-2 border-border group-hover:border-primary/50 transition-colors">
                      {/* نمایش عکس پروفایل */}
                      {user.avatar ? (
                          <img 
                            src={getAvatarUrl(user.avatar)} 
                            alt="پروفایل" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error("Dashboard avatar failed to load:", getAvatarUrl(user.avatar));
                              e.target.style.display = 'none';
                            }}
                            onLoad={() => {
                              console.log("Dashboard avatar loaded successfully:", getAvatarUrl(user.avatar));
                            }}
                          />
                      ) : (
                          <User className="w-8 h-8"/>
                      )}
                  </div>
                  {/* حذف دکمه ویرایش از روی عکس */}
                </div>
                
                <div className="space-y-2">
                  <h2 className="font-bold text-foreground text-lg">{user.full_name || "کاربر ناشناس"}</h2>
                  <span className="text-xs text-foreground-muted dir-ltr block">{user.mobile}</span>
                  
                  {/* 🟢 بج مدیریت بهبود یافته */}
                  {isAdmin && (
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full font-bold border border-emerald-500/20 shadow-sm">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L3 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.734.99A.996.996 0 0118 6v2a1 1 0 11-2 0v-.277l-1.254.145a1 1 0 11-.992-1.736L14.984 6l-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.723V12a1 1 0 11-2 0v-1.277l-1.246-.855a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.277l1.246.855a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.277V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364.372l.254.145V16a1 1 0 112 0v1.021l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01.128-1.736z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm">مدیر سیستم</span>
                      </div>
                  )}
                </div>
              </div>

              {/* دکمه ویرایش پروفایل */}
              <Link
                href="/profile"
                className="block w-full bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border border-primary/20 rounded-xl p-3 mb-6 text-center transition-all group"
              >
                <div className="flex items-center justify-center gap-2 text-primary group-hover:text-primary-hover">
                  <User className="w-4 h-4" />
                  <span className="font-medium text-sm">ویرایش پروفایل</span>
                </div>
              </Link>

              {/* دکمه‌های منو */}
              <nav className="space-y-1">
                {menuItems.map((item) => {
                    // 🔴 شرط مهم: اگر آیتم مال ادمین است ولی کاربر ادمین نیست، مخفی کن
                    if (item.adminOnly && !isAdmin) return null;

                    return (
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
                            {item.label}
                        </button>
                    );
                })}

                <button 
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-error hover:bg-error/10 rounded-xl font-medium transition-colors mt-4 border-t border-border pt-4"
                >
                    <LogOut className="w-5 h-5" />
                    خروج
                </button>
              </nav>
            </div>
          </div>

          {/* --- محتوای اصلی --- */}
          <div className="lg:col-span-3">
            
            {/* 1. سفارش‌های من */}
            {activeTab === 'my-orders' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
                            <span className="w-2 h-8 bg-primary rounded-full"></span>
                            سفارش‌های من
                        </h1>
                        <div className="text-sm text-foreground-muted bg-secondary px-3 py-1 rounded-full">
                            {userOrders.length} سفارش
                        </div>
                    </div>
                    
                    {userOrders.length > 0 ? (
                        <div className="space-y-6">
                            {userOrders.map(order => {
                                const getStatusConfig = (status) => {
                                    const configs = {
                                        PENDING: { 
                                            label: "در انتظار پرداخت", 
                                            bgColor: "bg-amber-50 dark:bg-amber-900/20", 
                                            textColor: "text-amber-600 dark:text-amber-400", 
                                            borderColor: "border-amber-200 dark:border-amber-800",
                                            icon: Clock
                                        },
                                        PAID: { 
                                            label: "پرداخت شده", 
                                            bgColor: "bg-emerald-50 dark:bg-emerald-900/20", 
                                            textColor: "text-emerald-600 dark:text-emerald-400", 
                                            borderColor: "border-emerald-200 dark:border-emerald-800",
                                            icon: CheckCircle
                                        },
                                        CANCELED: { 
                                            label: "لغو شده", 
                                            bgColor: "bg-red-50 dark:bg-red-900/20", 
                                            textColor: "text-red-600 dark:text-red-400", 
                                            borderColor: "border-red-200 dark:border-red-800",
                                            icon: XCircle
                                        },
                                        SENT: { 
                                            label: "تحویل داده شده", 
                                            bgColor: "bg-blue-50 dark:bg-blue-900/20", 
                                            textColor: "text-blue-600 dark:text-blue-400", 
                                            borderColor: "border-blue-200 dark:border-blue-800",
                                            icon: CheckCircle
                                        }
                                    };
                                    return configs[status] || configs.PENDING;
                                };
                                
                                const statusConfig = getStatusConfig(order.status);
                                const StatusIcon = statusConfig.icon;
                                
                                return (
                                    <div key={order.id} className="bg-card border border-border rounded-2xl p-6 shadow-theme hover:shadow-theme-lg transition-all group">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                                                    <ShoppingBag className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-foreground text-xl">سفارش #{order.id}</p>
                                                    <p className="text-sm text-foreground-muted flex items-center gap-2 mt-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(order.created_at).toLocaleDateString('fa-IR', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-3xl font-black text-primary mb-1">{formatPrice(order.total_price)}</p>
                                                <p className="text-xs text-foreground-muted">تومان</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}>
                                                <StatusIcon className="w-4 h-4" />
                                                {statusConfig.label}
                                            </span>
                                            <Link
                                                href={`/order/${order.id}`}
                                                className="flex items-center gap-2 text-primary hover:bg-primary/10 px-4 py-2 rounded-xl transition-colors font-medium group-hover:bg-primary/5"
                                            >
                                                <Eye className="w-5 h-5" />
                                                مشاهده جزئیات
                                                <ArrowLeft className="w-4 h-4" />
                                            </Link>
                                        </div>
                                        
                                        {/* نمایش تعداد آیتم‌ها */}
                                        {order.items && order.items.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-border">
                                                <div className="flex items-center gap-2 text-sm text-foreground-muted">
                                                    <Package className="w-4 h-4" />
                                                    <span>{order.items.length} محصول در این سفارش</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-foreground-muted bg-card rounded-2xl border border-dashed border-border">
                            <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium mb-2">هنوز سفارشی ثبت نکرده‌اید</p>
                            <p className="text-sm">برای شروع خرید به فروشگاه بروید</p>
                        </div>
                    )}
                </div>
            )}

            {/* 2. مدیریت محصولات (ادمین) */}
            {activeTab === 'admin-products' && isAdmin && <AdminProducts />}

            {/* 3. مدیریت سفارشات (ادمین) */}
            {activeTab === 'admin-orders' && isAdmin && <AdminOrders />}

            {/* 4. مدیریت کاربران (ادمین) - 🔴 اضافه شد */}
            {activeTab === 'admin-users' && isAdmin && <AdminUsers />}

            {/* 5. نظرات (ادمین) */}
            {activeTab === 'admin-comments' && isAdmin && (
                <div className="text-center py-20 text-foreground-muted bg-card rounded-2xl border border-dashed border-border">
                    <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-20"/>
                    بخش مدیریت نظرات به زودی اضافه می‌شود...
                </div>
            )}

          </div>

        </div>
      </div>




    </div>
  );
}