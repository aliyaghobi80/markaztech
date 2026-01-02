// مسیر: src/app/dashboard/page.jsx
"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { useRouter, useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { getAvatarUrl } from "@/lib/avatar";
import toast from "react-hot-toast";
import { 
  User, LogOut, Wallet, ShoppingBag, 
  CreditCard, Package, Users, MessageSquare,
  Calendar, ArrowLeft, Clock, CheckCircle, XCircle,
  Upload, BarChart3, Heart, Headphones, DollarSign,
  Menu, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useGlobalWebSocket } from "@/lib/globalWebSocket";

// ایمپورت کامپوننت‌های ادمین
import AdminProducts from "@/components/admin/AdminProducts";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminWalletRequests from "@/components/admin/AdminWalletRequests";
import AdminComments from "@/components/admin/AdminComments";
import AdminTickets from "@/components/admin/AdminTickets";
import AdminChat from "@/components/admin/AdminChat";

// ایمپورت کامپوننت‌های کاربر
import UserFavorites from "@/components/UserFavorites";
import UserComments from "@/components/UserComments";
import UserTickets from "@/components/UserTickets";
import UserDownloads from "@/components/UserDownloads";

function DashboardContent() {
  const { user, logout, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState("my-orders");
  const [userOrders, setUserOrders] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Handle URL parameters for tab switching
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      refreshUser();
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (activeTab === 'my-orders') {
        api.get("/orders/").then(res => setUserOrders(res.data)).catch(err => console.log(err));
    }
  }, [activeTab]);

  useEffect(() => {
    const isAdmin = user?.is_staff || user?.is_superuser || user?.role === 'ADMIN';
    if (isAdmin) {
      api.get("/users/admin/statistics/")
        .then(res => setAdminStats(res.data))
        .catch(err => console.log(err));
    }
  }, [user]);

  if (authLoading || !user) return <div className="text-center p-10">در حال بارگذاری...</div>;

  const isAdmin = user.is_staff || user.is_superuser || user.role === 'ADMIN';

    const menuItems = [
      { id: "my-orders", label: "سفارش‌های من", icon: ShoppingBag, adminOnly: false },
      { id: "wallet-charge", label: "افزایش موجودی", icon: Wallet, adminOnly: false },
      { id: "my-favorites", label: "علاقه‌مندی‌ها", icon: Heart, adminOnly: false },
      { id: "my-downloads", label: "فایل‌های من", icon: Package, adminOnly: false },
      { id: "my-comments", label: "نظرات من", icon: MessageSquare, adminOnly: false },
      { id: "my-tickets", label: "تیکت‌های پشتیبانی", icon: Headphones, adminOnly: false },
      
      { id: "admin-products", label: "مدیریت محصولات", icon: Package, adminOnly: true },
      { id: "admin-orders", label: "مدیریت پرداخت‌ها", icon: CreditCard, adminOnly: true },
      { id: "admin-wallet-requests", label: "درخواست‌های شارژ", icon: Wallet, adminOnly: true },
      { id: "admin-users", label: "مدیریت کاربران", icon: Users, adminOnly: true },
      { id: "admin-comments", label: "مدیریت نظرات", icon: MessageSquare, adminOnly: true },
      { id: "admin-tickets", label: "مدیریت تیکت‌ها", icon: Headphones, adminOnly: true },
      { id: "admin-chat", label: "چت پشتیبانی", icon: MessageSquare, adminOnly: true },
    ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 transition-colors duration-300">
      
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-20 right-4 z-50 bg-primary text-primary-foreground p-2 rounded-lg shadow-lg hover:bg-primary/90 transition-all duration-300"
      >
        {sidebarOpen ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      <div className="flex min-h-screen">
        
        {/* Collapsible Sidebar */}
        <div className={`fixed right-0 top-16 h-[calc(100vh-4rem)] bg-card border-l border-border shadow-2xl z-40 transition-all duration-300 overflow-hidden ${
          sidebarOpen ? 'w-80 translate-x-0 opacity-100 visible' : 'w-0 translate-x-full opacity-0 invisible'
        }`}>
          {sidebarOpen && (
            <div className="h-full overflow-y-auto p-6 pt-8 w-80">
              
              {/* پروفایل */}
              <div className="text-center mb-6">
                <div className="relative group">
                  <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3 text-primary overflow-hidden border-2 border-border group-hover:border-primary/50 transition-colors">
                      {user.avatar ? (
                          <img 
                            src={getAvatarUrl(user.avatar)} 
                            alt="پروفایل" 
                            className="w-full h-full object-cover"
                          />
                      ) : (
                          <User className="w-8 h-8"/>
                      )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h2 className="font-bold text-foreground text-lg">{user.full_name || "کاربر ناشناس"}</h2>
                  <span className="text-xs text-foreground-muted dir-ltr block">{user.mobile}</span>
                  
                  {isAdmin && (
                      <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full font-bold border border-emerald-500/20 shadow-sm">
                          <span className="text-xs">مدیر سیستم</span>
                      </div>
                  )}
                </div>
              </div>

              <Link
                href="/profile"
                className="block w-full bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl p-3 mb-6 text-center transition-all group"
              >
                <div className="flex items-center justify-center gap-2 text-primary">
                  <User className="w-4 h-4" />
                  <span className="font-medium text-sm">ویرایش پروفایل</span>
                </div>
              </Link>

              {/* دکمه‌های منو */}
              <nav className="flex flex-col gap-1">
                {menuItems.map((item) => {
                    if (item.adminOnly && !isAdmin) return null;

                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              // روی موبایل sidebar رو ببند
                              if (window.innerWidth < 1024) {
                                setSidebarOpen(false);
                              }
                            }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all w-full ${
                                activeTab === item.id 
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                                : "text-foreground-muted hover:bg-secondary hover:text-foreground"
                            }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-sm">{item.label}</span>
                        </button>
                    );
                })}

                <button 
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error/10 rounded-xl font-medium transition-colors mt-4 border-t border-border pt-4 w-full"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm">خروج</span>
                </button>
              </nav>
            </div>
          )}
        </div>

        {/* Sidebar Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'lg:mr-80' : 'mr-0'
        } min-h-screen`}>
          <div className="container mx-auto px-4 py-8 h-full">
            
            {/* Welcome Header */}
            <div className="mb-8">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-foreground mb-2 text-center md:text-right">
                      خوش آمدید، {user.full_name || "کاربر عزیز"}! 👋
                    </h1>
                    <p className="text-foreground-muted text-center md:text-right">
                      {isAdmin ? "پنل مدیریت سیستم مرکز تک" : "داشبورد شخصی شما در مرکز تک"}
                    </p>
                  </div>
                  <div className="text-left w-full md:w-auto">
                    <div className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 flex flex-col items-center md:items-start">
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
                      <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0">
                        <DollarSign className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-[10px] md:text-xs text-foreground-muted">فروش کل</p>
                        <p className="text-sm md:text-lg font-black text-green-500 truncate">{formatPrice(adminStats.total_sales)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] md:text-xs text-foreground-muted">سفارشات</p>
                        <p className="text-sm md:text-lg font-black text-foreground">{adminStats.total_orders}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-[10px] md:text-xs text-foreground-muted">کاربران</p>
                        <p className="text-sm md:text-lg font-black text-foreground">{adminStats.total_users}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-[10px] md:text-xs text-foreground-muted">محصولات</p>
                        <p className="text-sm md:text-lg font-black text-foreground">{adminStats.active_products}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Content Area */}
            <div className="h-[calc(100vh-200px)] overflow-y-auto">
              
              {activeTab === 'my-orders' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center justify-between mb-6">
                          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
                              <span className="w-2 h-8 bg-primary rounded-full"></span>
                              سفارش‌های من
                          </h1>
                      </div>
                      
                      {userOrders.length > 0 ? (
                          <div className="space-y-6">
                              {userOrders.map(order => (
                                  <OrderListItem key={order.id} order={order} />
                              ))}
                          </div>
                      ) : (
                          <EmptyState icon={ShoppingBag} title="هنوز سفارشی ثبت نکرده‌اید" description="برای شروع خرید به فروشگاه بروید" />
                      )}
                  </div>
              )}

              {activeTab === 'wallet-charge' && <WalletChargeSection user={user} />}
              
              {activeTab === 'my-favorites' && <UserFavorites />}
              {activeTab === 'my-downloads' && <UserDownloads />}
              {activeTab === 'my-comments' && <UserComments />}
              {activeTab === 'my-tickets' && <UserTickets />}

              {activeTab === 'admin-products' && isAdmin && <AdminProducts />}
              {activeTab === 'admin-orders' && isAdmin && <AdminOrders />}
              {activeTab === 'admin-wallet-requests' && isAdmin && <AdminWalletRequests />}
              {activeTab === 'admin-users' && isAdmin && <AdminUsers />}
              {activeTab === 'admin-comments' && isAdmin && <AdminComments />}
              {activeTab === 'admin-tickets' && isAdmin && <AdminTickets />}
              {activeTab === 'admin-chat' && isAdmin && <AdminChat />}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderListItem({ order }) {
    const getStatusConfig = (status) => {
        const configs = {
            PENDING: { label: "در انتظار پرداخت", bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400", border: "border-amber-200", icon: Clock },
            PAID: { label: "پرداخت شده", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200", icon: CheckCircle },
            CANCELED: { label: "لغو شده", bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600 dark:text-red-400", border: "border-red-200", icon: XCircle },
            SENT: { label: "تحویل داده شده", bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200", icon: CheckCircle }
        };
        return configs[status] || configs.PENDING;
    };
    
    const config = getStatusConfig(order.status);
    const StatusIcon = config.icon;

    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-theme hover:shadow-theme-lg transition-all group">
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                        <ShoppingBag className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="font-black text-foreground text-xl">سفارش #{order.id}</p>
                        <p className="text-sm text-foreground-muted flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(order.created_at).toLocaleDateString('fa-IR')}
                        </p>
                    </div>
                </div>
                <div className="text-center md:text-left">
                    <p className="text-2xl font-black text-primary">{formatPrice(order.total_price)} تومان</p>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border ${config.bg} ${config.text} ${config.border}`}>
                    <StatusIcon className="w-4 h-4" />
                    {config.label}
                </span>
                <Link
                    href={`/order/${order.id}`}
                    className="flex items-center gap-2 text-primary hover:bg-primary/10 px-4 py-2 rounded-xl transition-colors font-medium"
                >
                    مشاهده جزئیات
                    <ArrowLeft className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}

function EmptyState({ icon: Icon, title, description }) {
    return (
        <div className="text-center py-20 text-foreground-muted bg-card rounded-2xl border border-dashed border-border animate-in fade-in duration-700">
            <Icon className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">{title}</p>
            <p className="text-sm">{description}</p>
        </div>
    );
}


function WalletChargeSection({ user }) {
  const [amount, setAmount] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetcher = (url) => api.get(url).then((res) => res.data.results || res.data);
  const { data: myRequests = [], mutate } = useSWR("/users/wallet-requests/", fetcher);

  const bankCardNumber = "6037997310266797";
  const bankCardOwner = "علی یعقوبی - بانک ملی";

  // مبالغ پیش‌فرض
  const presetAmounts = [
    { label: "20 هزار تومان", value: 20000 },
    { label: "50 هزار تومان", value: 50000 },
    { label: "100 هزار تومان", value: 100000 },
    { label: "200 هزار تومان", value: 200000 },
    { label: "500 هزار تومان", value: 500000 },
    { label: "1 میلیون تومان", value: 1000000 }
  ];

  // WebSocket listener for real-time updates
  const handleWebSocketMessage = useCallback((data) => {
    if (data.type === 'wallet_request_update') {
      mutate(); // Refresh the requests list
      
      // Dispatch window event for backward compatibility
      window.dispatchEvent(new CustomEvent('wallet_request_status_changed', {
        detail: { 
          request_id: data.request_id, 
          status: data.status,
          admin_note: data.admin_note
        }
      }));
      
      // Show toast notification
      if (data.status === 'approved') {
        toast.success("درخواست شارژ تایید شد!");
      } else if (data.status === 'rejected') {
        toast.error("درخواست شارژ رد شد!");
      }
    }
  }, [mutate]);

  useGlobalWebSocket('wallet-charge-section', handleWebSocketMessage);

  useEffect(() => {
    const handleStatusChange = (event) => {
      mutate();
      if (event.detail.status === 'approved') {
        toast.success("درخواست شارژ تایید شد!");
      }
    };
    window.addEventListener('wallet_request_status_changed', handleStatusChange);
    return () => window.removeEventListener('wallet_request_status_changed', handleStatusChange);
  }, [mutate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setReceiptPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // فرمت‌دهی مبلغ با کاما
  const formatAmountInput = (value) => {
    // حذف همه کاراکترهای غیرعددی
    const numericValue = value.replace(/[^\d]/g, '');
    // اضافه کردن کاما
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleAmountChange = (e) => {
    const formattedValue = formatAmountInput(e.target.value);
    setAmount(formattedValue);
  };

  const handlePresetAmount = (value) => {
    setAmount(formatAmountInput(value.toString()));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !receiptFile) return toast.error("تکمیل تمام فیلدها الزامی است");
    
    // تبدیل مبلغ به عدد (حذف کاما)
    const numericAmount = amount.replace(/,/g, '');
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("amount", numericAmount);
      formData.append("receipt_image", receiptFile);
      await api.post("/users/wallet-requests/", formData);
      toast.success("درخواست با موفقیت ثبت شد");
      setAmount(""); setReceiptFile(null); setReceiptPreview(null);
      mutate();
    } catch (error) {
      toast.error("خطا در ثبت درخواست");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <span className="w-2 h-8 bg-primary rounded-full"></span>
            شارژ کیف پول
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6">
                <div className="mb-6 p-4 bg-secondary/50 rounded-xl">
                    <p className="text-sm font-bold mb-3 text-foreground">واریز به کارت:</p>
                    <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                        <span className="font-mono text-lg">{bankCardNumber}</span>
                        <button onClick={() => {navigator.clipboard.writeText(bankCardNumber); toast.success("کپی شد")}} className="text-primary text-xs font-bold">کپی</button>
                    </div>
                    <p className="text-[10px] mt-2 text-foreground-muted">{bankCardOwner}</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* دکمه‌های مبلغ پیش‌فرض */}
                    <div className="mb-4">
                        <p className="text-sm font-medium text-foreground mb-3">انتخاب سریع مبلغ:</p>
                        <div className="grid grid-cols-2 gap-2">
                            {presetAmounts.map((preset, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handlePresetAmount(preset.value)}
                                    className="px-3 py-2 text-xs font-medium bg-secondary hover:bg-primary hover:text-primary-foreground border border-border rounded-lg transition-all"
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <input 
                            type="text" 
                            value={amount} 
                            onChange={handleAmountChange}
                            placeholder="مبلغ (تومان)" 
                            className="w-full bg-secondary rounded-xl p-3 text-sm outline-none border border-border focus:border-primary transition-colors" 
                        />
                        {amount && (
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs text-foreground-muted">
                                تومان
                            </div>
                        )}
                    </div>
                    
                    <div className="relative border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:bg-secondary/30 transition-colors">
                        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        {receiptPreview ? (
                            <div className="space-y-2">
                                <img src={receiptPreview} className="h-32 mx-auto rounded-lg object-cover" />
                                <p className="text-xs text-success">فیش آپلود شد</p>
                            </div>
                        ) : (
                            <div className="text-foreground-muted text-xs">
                                <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>آپلود رسید پرداخت</p>
                                <p className="text-[10px] mt-1 opacity-70">فرمت‌های مجاز: JPG, PNG</p>
                            </div>
                        )}
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={loading || !amount || !receiptFile} 
                        className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "در حال ارسال..." : "ثبت درخواست"}
                    </button>
                </form>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    درخواست‌های اخیر
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {myRequests.length > 0 ? myRequests.map(req => (
                        <div key={req.id} className="p-4 bg-secondary/30 rounded-xl border border-border/50 hover:bg-secondary/50 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <p className="text-sm font-bold">{formatPrice(req.amount)} تومان</p>
                                    <p className="text-[10px] text-foreground-muted">{new Date(req.created_at).toLocaleDateString('fa-IR')}</p>
                                </div>
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                                    req.status === 'approved' ? 'bg-success/10 text-success border border-success/20' : 
                                    req.status === 'rejected' ? 'bg-error/10 text-error border border-error/20' : 
                                    'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                }`}>
                                    {req.status === 'approved' ? 'تایید شده' : req.status === 'rejected' ? 'رد شده' : 'در انتظار'}
                                </span>
                            </div>
                            {req.admin_note && (
                                <div className="mt-2 p-2 bg-card rounded-lg border border-border">
                                    <p className="text-[10px] text-foreground-muted mb-1">یادداشت ادمین:</p>
                                    <p className="text-xs text-foreground">{req.admin_note}</p>
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="text-center py-8 text-foreground-muted">
                            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">هنوز درخواستی ثبت نکرده‌اید</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>}>
      <DashboardContent />
    </Suspense>
  );
}