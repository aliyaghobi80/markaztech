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
  Eye, Calendar, ArrowLeft, Clock, CheckCircle, XCircle,
  Plus, Upload, Loader2, TrendingUp, DollarSign, Activity, BarChart3
} from "lucide-react";
import Link from "next/link";

// ایمپورت کامپوننت‌های ادمین
import AdminProducts from "@/components/admin/AdminProducts";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminWalletRequests from "@/components/admin/AdminWalletRequests";


export default function DashboardPage() {
  const { user, logout, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("my-orders");
  const [userOrders, setUserOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [adminStats, setAdminStats] = useState(null);

  // رفرش اطلاعات کاربر هنگام ورود به داشبورد
  useEffect(() => {
    if (user) {
      refreshUser();
    }
  }, []);

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

  // گرفتن آمار برای ادمین
  useEffect(() => {
    const isAdmin = user?.is_staff || user?.is_superuser || user?.role === 'ADMIN';
    if (isAdmin) {
      api.get("/users/admin/statistics/")
        .then(res => setAdminStats(res.data))
        .catch(err => console.log(err));
    }
  }, [user]);



  if (authLoading || !user) return <div className="text-center p-10">در حال بارگذاری...</div>;



  // 🔴 تشخیص نقش کاربر (ادمین یا کاربر عادی)
  // ما هم is_staff (استاندارد جنگو) را چک میکنیم هم role (اگر دستی ساختید)
  const isAdmin = user.is_staff || user.is_superuser || user.role === 'ADMIN';

    // لیست منوها
    const menuItems = [
      { id: "my-orders", label: "سفارش‌های من", icon: ShoppingBag, adminOnly: false },
      { id: "wallet-charge", label: "افزایش موجودی", icon: Wallet, adminOnly: false },
      { id: "admin-products", label: "مدیریت محصولات", icon: Package, adminOnly: true },
      { id: "admin-orders", label: "مدیریت پرداخت‌ها", icon: CreditCard, adminOnly: true },
      { id: "admin-wallet-requests", label: "درخواست‌های شارژ", icon: Wallet, adminOnly: true },
      { id: "admin-users", label: "مدیریت کاربران", icon: Users, adminOnly: true },
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

        {/* Admin Statistics Section */}
        {isAdmin && adminStats && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              آمار کلی سیستم
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-foreground-muted">فروش کل</p>
                    <p className="text-lg font-black text-green-500">{formatPrice(adminStats.total_sales)} <span className="text-xs font-normal">تومان</span></p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-foreground-muted">سفارشات</p>
                    <p className="text-lg font-black text-foreground">{adminStats.total_orders}</p>
                    {adminStats.pending_orders > 0 && (
                      <p className="text-xs text-amber-500">{adminStats.pending_orders} در انتظار</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-foreground-muted">کاربران</p>
                    <p className="text-lg font-black text-foreground">{adminStats.total_users}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-foreground-muted">محصولات</p>
                    <p className="text-lg font-black text-foreground">{adminStats.active_products} <span className="text-xs font-normal text-foreground-muted">فعال</span></p>
                  </div>
                </div>
              </div>
            </div>
            {adminStats.pending_wallet_requests > 0 && (
              <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-amber-500" />
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    {adminStats.pending_wallet_requests} درخواست شارژ کیف پول در انتظار بررسی
                  </span>
                </div>
                <button 
                  onClick={() => setActiveTab('admin-wallet-requests')}
                  className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors"
                >
                  مشاهده
                </button>
              </div>
            )}
          </div>
        )}
        
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

            {/* 2. شارژ کیف پول */}
            {activeTab === 'wallet-charge' && <WalletChargeSection user={user} />}

            {/* 3. مدیریت محصولات (ادمین) */}
            {activeTab === 'admin-products' && isAdmin && <AdminProducts />}

            {/* 4. مدیریت سفارشات (ادمین) */}
            {activeTab === 'admin-orders' && isAdmin && <AdminOrders />}

            {/* 5. مدیریت درخواست‌های شارژ (ادمین) */}
            {activeTab === 'admin-wallet-requests' && isAdmin && <AdminWalletRequests />}

            {/* 6. مدیریت کاربران (ادمین) */}
            {activeTab === 'admin-users' && isAdmin && <AdminUsers />}

          </div>

        </div>
      </div>
    </div>
  );
}


function WalletChargeSection({ user }) {
  const [amount, setAmount] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const bankCardNumber = "6037997310266797";
  const bankCardOwner = "علی یعقوبی - بانک ملی";

  const predefinedAmounts = [50000, 100000, 200000, 500000, 1000000];

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const response = await api.get("/users/wallet-requests/");
      setMyRequests(response.data.results || response.data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم فایل نباید بیشتر از 5 مگابایت باشد");
        return;
      }
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setReceiptPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const copyCardNumber = () => {
    navigator.clipboard.writeText(bankCardNumber);
    toast.success("شماره کارت کپی شد");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseInt(amount) < 10000) {
      toast.error("حداقل مبلغ شارژ ۱۰,۰۰۰ تومان است");
      return;
    }
    
    if (!receiptFile) {
      toast.error("لطفاً تصویر رسید پرداخت را آپلود کنید");
      return;
    }
    
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("amount", amount);
      formData.append("receipt_image", receiptFile);
      
      await api.post("/users/wallet-requests/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      toast.success("درخواست شارژ با موفقیت ثبت شد. پس از تایید ادمین، موجودی شما افزایش می‌یابد.");
      setAmount("");
      setReceiptFile(null);
      setReceiptPreview(null);
      fetchMyRequests();
    } catch (error) {
      const errorMsg = error.response?.data?.amount?.[0] || 
                       error.response?.data?.receipt_image?.[0] || 
                       "خطا در ثبت درخواست";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: { label: "در انتظار بررسی", bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400", icon: Clock },
      APPROVED: { label: "تایید شده", bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400", icon: CheckCircle },
      REJECTED: { label: "رد شده", bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400", icon: XCircle }
    };
    return configs[status] || configs.PENDING;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <span className="w-2 h-8 bg-primary rounded-full"></span>
          افزایش موجودی کیف پول
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="mb-6 p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
            <p className="text-sm text-foreground-muted mb-1">موجودی فعلی</p>
            <p className="text-3xl font-black text-primary">{formatPrice(user?.wallet_balance || 0)} <span className="text-lg font-normal">تومان</span></p>
          </div>

          <div className="mb-6 p-4 bg-secondary/50 rounded-xl">
            <p className="text-sm font-medium text-foreground mb-3">اطلاعات کارت برای واریز:</p>
            <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
              <div>
                <p className="text-lg font-mono tracking-widest text-foreground" dir="ltr" style={{ direction: 'ltr' }}>
                  {bankCardNumber.replace(/(\d{4})/g, '$1-').slice(0, -1)}
                </p>
                <p className="text-sm text-foreground-muted mt-1">{bankCardOwner}</p>
              </div>
              <button
                onClick={copyCardNumber}
                className="px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
              >
                کپی
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">مبلغ شارژ (تومان)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="مبلغ را وارد کنید..."
                className="w-full bg-secondary border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
                min="10000"
                required
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {predefinedAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt.toString())}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      amount === amt.toString()
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground-muted hover:bg-secondary/80'
                    }`}
                  >
                    {formatPrice(amt)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">تصویر رسید پرداخت</label>
              <div 
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  receiptPreview ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  required
                />
                {receiptPreview ? (
                  <div className="space-y-3">
                    <img src={receiptPreview} alt="پیش‌نمایش رسید" className="max-h-40 mx-auto rounded-lg" />
                    <p className="text-sm text-primary">برای تغییر کلیک کنید</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-10 h-10 mx-auto text-foreground-muted" />
                    <p className="text-foreground-muted">برای آپلود کلیک کنید</p>
                    <p className="text-xs text-foreground-muted">فرمت‌های مجاز: JPG, PNG (حداکثر 5MB)</p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  در حال ارسال...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  ثبت درخواست شارژ
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">درخواست‌های قبلی من</h3>
          
          {loadingRequests ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-foreground-muted" />
            </div>
          ) : myRequests.length === 0 ? (
            <div className="text-center py-8 text-foreground-muted">
              <Wallet className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>هنوز درخواستی ثبت نکرده‌اید</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {myRequests.map((req) => {
                const statusConfig = getStatusConfig(req.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div key={req.id} className="p-4 bg-secondary/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-foreground">{formatPrice(req.amount)} تومان</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-xs text-foreground-muted">
                      {new Date(req.created_at).toLocaleDateString('fa-IR', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                    {req.admin_note && (
                      <p className="text-xs text-foreground-muted mt-2 p-2 bg-secondary rounded-lg">
                        توضیحات: {req.admin_note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}