// مسیر: src/app/admin/orders/page.jsx
"use client";

import { useState } from "react";
import useSWR from "swr";
import api from "@/lib/axios";
import { formatPrice } from "@/lib/utils";
import { 
    CheckCircle, 
    XCircle, 
    Eye, 
    Download, 
    Zap, 
    Search, 
    Filter, 
    Truck, 
    RotateCcw,
    Edit3,
    Save,
    MoreVertical,
    Clock,
    AlertCircle,
    Wallet,
    CreditCard,
    FileText
} from "lucide-react";
import toast from "react-hot-toast";
import { downloadOrderPDF } from "@/lib/pdfGenerator";
import { motion, AnimatePresence } from "framer-motion";

const fetcher = (url) => api.get(url).then((res) => res.data);

export default function AdminOrdersPage() {
    const { data: orders, mutate } = useSWR("/orders/", fetcher);
    const [searchQuery, setSearchSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [editingNotes, setEditingNotes] = useState(null);
    const [notesValue, setNotesValue] = useState("");

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.patch(`/orders/${id}/`, { status: newStatus });
            toast.success("وضعیت سفارش تغییر کرد");
            mutate();
        } catch (error) {
            toast.error("خطا در تغییر وضعیت");
        }
    };

    const handleUpdateNotes = async (id) => {
        try {
            await api.patch(`/orders/${id}/`, { admin_notes: notesValue });
            toast.success("توضیحات به‌روزرسانی شد");
            setEditingNotes(null);
            mutate();
        } catch (error) {
            toast.error("خطا در ذخیره توضیحات");
        }
    };

    const startEditingNotes = (order) => {
        setEditingNotes(order.id);
        setNotesValue(order.admin_notes || "");
    };

    const statusBadge = (status) => {
        const styles = {
            'PENDING': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            'PAID': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            'CANCELED': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
            'SENT': 'bg-sky-500/10 text-sky-500 border-sky-500/20'
        };
        const labels = {
            'PENDING': 'در انتظار تایید',
            'PAID': 'آماده تحویل',
            'CANCELED': 'لغو شده',
            'SENT': 'تحویل شده'
        };
        const Icons = {
            'PENDING': Clock,
            'PAID': CheckCircle,
            'CANCELED': XCircle,
            'SENT': Zap
        };
        const Icon = Icons[status] || AlertCircle;

        return (
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${styles[status]}`}>
                <Icon className="w-3.5 h-3.5" />
                {labels[status]}
            </span>
        );
    };

    const paymentMethodBadge = (order) => {
        if (!order.payment_method || order.payment_method === 'NONE') return null;

        const isWallet = order.payment_method === 'WALLET';
        const isOnline = order.payment_method === 'ONLINE';
        const Icon = isWallet ? Wallet : isOnline ? Zap : CreditCard;
        const label = order.payment_method_display || (isWallet ? "کیف پول" : isOnline ? "درگاه مستقیم" : "کارت به کارت");

        return (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border bg-secondary/30 text-foreground-muted border-border/50">
                <Icon className="w-3.5 h-3.5 opacity-70" />
                {label}
            </span>
        );
    };

    if (!orders) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.id.toString().includes(searchQuery) ||
            order.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.user?.mobile?.includes(searchQuery);
        
        const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const ActionButtons = ({ order }) => {
        const btnClass = "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 active:scale-95";
        
        return (
            <div className="flex flex-wrap items-center gap-2">
                {/* Transitions from PENDING */}
                {order.status === 'PENDING' && (
                    <>
                        <button 
                            onClick={() => handleStatusChange(order.id, 'PAID')}
                            className={`${btnClass} bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20`}
                        >
                            <CheckCircle className="w-4 h-4" />
                            تایید پرداخت و فیش
                        </button>
                        <button 
                            onClick={() => handleStatusChange(order.id, 'CANCELED')}
                            className={`${btnClass} bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white`}
                        >
                            <XCircle className="w-4 h-4" />
                            رد فیش / لغو
                        </button>
                    </>
                )}

                {/* Transitions from PAID */}
                {order.status === 'PAID' && (
                    <>
                        <button 
                            onClick={() => handleStatusChange(order.id, 'SENT')}
                            className={`${btnClass} bg-sky-500 text-white hover:bg-sky-600 shadow-md shadow-sky-500/20`}
                        >
                            <Zap className="w-4 h-4" />
                            لایسنس ارسال شد
                        </button>
                        <button 
                            onClick={() => handleStatusChange(order.id, 'CANCELED')}
                            className={`${btnClass} bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white`}
                        >
                            <XCircle className="w-4 h-4" />
                            لغو سفارش
                        </button>
                    </>
                )}

                {/* Transitions from SENT */}
                {order.status === 'SENT' && (
                    <>
                        <button 
                            onClick={() => handleStatusChange(order.id, 'PAID')}
                            className={`${btnClass} bg-secondary/50 text-foreground-muted hover:bg-secondary`}
                        >
                            <RotateCcw className="w-4 h-4" />
                            بازگشت به آماده تحویل
                        </button>
                    </>
                )}

                {/* Transitions from CANCELED */}
                {order.status === 'CANCELED' && (
                    <button 
                        onClick={() => handleStatusChange(order.id, 'PENDING')}
                        className={`${btnClass} bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white`}
                    >
                        <RotateCcw className="w-4 h-4" />
                        بررسی مجدد
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-foreground">مدیریت سفارش‌ها</h1>
                    <p className="text-foreground-muted text-xs mt-1">لیست تمامی تراکنش‌های فروشگاه</p>
                </div>
                
                <div className="flex items-center gap-3 bg-card p-1 rounded-2xl border border-border">
                    <div className="px-4 py-2 bg-primary/5 rounded-xl text-primary font-bold text-xs flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" />
                        {orders.length} کل
                    </div>
                    <div className="px-4 py-2 bg-amber-500/5 rounded-xl text-amber-600 font-bold text-xs flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        {orders.filter(o => o.status === 'PENDING').length} جدید
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8 relative group">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted group-focus-within:text-primary transition-colors" />
                    <input 
                        type="text" 
                        placeholder="جستجو (اسم، موبایل، کد سفارش...)"
                        value={searchQuery}
                        onChange={(e) => setSearchSearchQuery(e.target.value)}
                        className="w-full bg-card border border-border rounded-xl py-3 pr-11 pl-4 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-xs font-medium"
                    />
                </div>
                
                <div className="lg:col-span-4 flex items-center gap-1 bg-card border border-border rounded-xl p-1 shadow-sm overflow-x-auto whitespace-nowrap">
                    {['ALL', 'PENDING', 'PAID', 'SENT', 'CANCELED'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${
                                statusFilter === s 
                                ? 'bg-primary text-white shadow-md shadow-primary/20' 
                                : 'text-foreground-muted hover:bg-secondary/50'
                            }`}
                        >
                            {s === 'ALL' ? 'همه' : s === 'PENDING' ? 'در انتظار' : s === 'PAID' ? 'آماده' : s === 'SENT' ? 'تحویل شده' : 'لغو'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            <div className="grid gap-6 pb-20">
                <AnimatePresence mode="popLayout">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order, index) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                                key={order.id} 
                                className="bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden group/card hover:shadow-xl hover:shadow-primary/5 transition-all"
                            >
                                <div className="p-6 md:p-10 flex flex-col xl:flex-row gap-8">
                                    {/* Left: Client Info */}
                                    <div className="flex items-start gap-5 xl:min-w-[300px]">
                                        <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/30 rounded-[2rem] flex items-center justify-center font-black text-xl text-primary shrink-0 border border-border">
                                            #{order.id}
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <h3 className="font-black text-lg text-foreground leading-tight">
                                                    {order.user?.full_name || 'کاربر بدون نام'}
                                                </h3>
                                                <p className="text-[11px] font-bold text-foreground-muted mt-1 uppercase tracking-widest opacity-60">CLIENT ACCOUNT</p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-foreground-secondary">
                                                    <span className="bg-secondary px-2.5 py-1 rounded-lg border border-border/50">{order.user?.mobile}</span>
                                                    <span className="w-1 h-1 bg-border rounded-full"></span>
                                                    <span className="opacity-70">{new Date(order.created_at).toLocaleString('fa-IR')}</span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {statusBadge(order.status)}
                                                    {paymentMethodBadge(order)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle: Financials */}
                                    <div className="flex flex-row xl:flex-col items-center xl:items-start justify-between xl:justify-center gap-2 xl:min-w-[200px] xl:border-r xl:border-border/20 xl:pr-8 border-y md:border-y-0 py-6 md:py-0">
                                        <div className="space-y-0.5">
                                            <div className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">مبلغ کل</div>
                                            <div className="text-2xl font-black text-primary tracking-tighter">
                                                {formatPrice(order.total_price)} <span className="text-[10px] font-bold">تومان</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 opacity-80">
                                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
                                            <span className="text-[10px] font-black text-foreground-muted uppercase tracking-widest">
                                                {order.items?.length || 0} PREMIUM ITEM
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right: Quick Actions */}
                                    <div className="flex-1 flex flex-col justify-center gap-5">
                                        <div className="flex flex-wrap items-center gap-3">
                                            {order.payment_receipt ? (
                                                <div className="flex items-center gap-2 p-1.5 pr-4 bg-primary/5 rounded-[1.25rem] border border-primary/10 group/receipt relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent translate-x-full group-hover/receipt:-translate-x-full transition-transform duration-700"></div>
                                                    <div className="flex items-center gap-3 relative z-10">
                                                        <FileText className="w-4 h-4 text-primary" />
                                                        <span className="text-[11px] font-black text-primary">فیش پرداخت ضمیمه شد</span>
                                                    </div>
                                                    <div 
                                                        onClick={() => window.open(order.payment_receipt, '_blank')}
                                                        className="w-10 h-10 rounded-xl border border-primary/20 overflow-hidden bg-white shrink-0 cursor-pointer hover:ring-4 hover:ring-primary/10 transition-all relative z-10 shadow-sm"
                                                    >
                                                        <img 
                                                            src={order.payment_receipt} 
                                                            alt="Receipt" 
                                                            className="w-full h-full object-cover group-hover/receipt:scale-125 transition-transform duration-500"
                                                        />
                                                    </div>
                                                </div>
                                            ) : order.payment_method === 'WALLET' ? (
                                                <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-4 py-2.5 rounded-xl text-[11px] font-black border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                                                    <Wallet className="w-4 h-4" />
                                                    پرداخت مستقیم از کیف پول
                                                </div>
                                            ) : (
                                                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black border border-dashed transition-all ${
                                                    order.payment_method === 'CARD' 
                                                    ? 'text-amber-500 bg-amber-500/5 border-amber-500/20' 
                                                    : 'text-foreground-muted bg-secondary/30 border-border opacity-70'
                                                }`}>
                                                    <AlertCircle className="w-4 h-4" />
                                                    {order.payment_method === 'CARD' ? 'منتظر تایید ادمین' : 'در انتظار پرداخت'}
                                                </div>
                                            )}
                                            
                                            {order.status !== 'CANCELED' && (
                                                <button 
                                                    onClick={async (e) => {
                                                        const btn = e.currentTarget;
                                                        const originalContent = btn.innerHTML;
                                                        try {
                                                            btn.disabled = true;
                                                            btn.innerHTML = '<span class="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full font-bold"></span>';
                                                            await downloadOrderPDF(order);
                                                            toast.success("فاکتور با موفقیت تولید شد");
                                                        } catch (err) {
                                                            toast.error(err.message);
                                                        } finally {
                                                            btn.disabled = false;
                                                            btn.innerHTML = originalContent;
                                                        }
                                                    }}
                                                    className="flex items-center gap-2 text-foreground hover:bg-secondary bg-secondary/30 px-4 py-2.5 rounded-xl text-[11px] font-black transition-all border border-border hover:border-foreground-muted shadow-sm"
                                                >
                                                    <Download className="w-4 h-4 stroke-[2.5]" />
                                                    مشاهده فاکتور
                                                </button>
                                            )}
                                        </div>

                                        <div className="h-px bg-gradient-to-r from-border/50 via-border/10 to-transparent w-full"></div>

                                        <ActionButtons order={order} />
                                    </div>
                                </div>

                                {/* Footer: items & Notes */}
                                <div className="px-6 md:px-10 py-6 border-t border-border/10 bg-secondary/[0.02] flex flex-col gap-6">
                                    {/* Products */}
                                    <div className="flex items-center gap-4">
                                        <div className="text-[10px] font-black text-foreground-muted uppercase tracking-widest whitespace-nowrap opacity-50">آیتم‌های خریداری شده:</div>
                                        <div className="flex flex-wrap gap-2">
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2 bg-card px-4 py-1.5 rounded-xl border border-border shadow-sm text-[11px] font-bold">
                                                    <div className="w-5 h-5 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-[9px] font-black border border-primary/10">
                                                        {item.quantity}
                                                    </div>
                                                    <span className="text-foreground-secondary">{item.product?.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Notes - License Section */}
                                    <div className={`rounded-3xl p-6 border transition-all duration-500 relative overflow-hidden group/notes ${
                                        order.admin_notes 
                                        ? 'bg-primary/[0.03] border-primary/20 shadow-inner' 
                                        : 'bg-card/40 border-dashed border-border group-hover/notes:border-primary/30'
                                    }`}>
                                        <div className="flex items-center justify-between mb-4 relative z-10">
                                            <div className="flex items-center gap-2 text-[11px] font-black text-primary uppercase tracking-widest">
                                                <Edit3 className="w-4 h-4" />
                                                ارسال لایسنس و اطلاعات اکانت
                                            </div>
                                            {editingNotes !== order.id && (
                                                <button 
                                                    onClick={() => startEditingNotes(order)}
                                                    className="bg-primary/10 hover:bg-primary text-primary hover:text-white p-2 rounded-xl transition-all shadow-sm"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        
                                        {/* Background Decoration */}
                                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none translate-x-1/4 -translate-y-1/4">
                                            <Edit3 className="w-32 h-32 rotate-12" />
                                        </div>

                                        <div className="relative z-10">
                                            {editingNotes === order.id ? (
                                                <div className="space-y-4">
                                                    <textarea 
                                                        autoFocus
                                                        value={notesValue}
                                                        onChange={(e) => setNotesValue(e.target.value)}
                                                        placeholder="یوزرنیم، پسورد، یا کد لایسنس اکانت را اینجا وارد کنید..."
                                                        className="w-full bg-card border-2 border-primary/20 rounded-2xl p-4 text-xs font-bold outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 min-h-[100px] leading-relaxed transition-all shadow-lg"
                                                    />
                                                    <div className="flex justify-end gap-3">
                                                        <button 
                                                            onClick={() => setEditingNotes(null)} 
                                                            className="px-6 py-2 rounded-xl text-[11px] font-black text-foreground-muted hover:bg-secondary transition-all"
                                                        >
                                                            انصراف
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUpdateNotes(order.id)}
                                                            className="bg-primary text-white px-8 py-2.5 rounded-xl text-[11px] font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                                        >
                                                            بروزرسانی لایسنس
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-foreground font-bold leading-loose">
                                                    {order.admin_notes ? (
                                                        <div className="bg-card/50 p-4 rounded-2xl border border-primary/10 select-all backdrop-blur-sm">
                                                            <span className="whitespace-pre-wrap">{order.admin_notes}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="py-2 flex items-center gap-2 text-foreground-muted/40 italic">
                                                            <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                                                            هنوز هیچ لایسنسی برای این سفارش ثبت نشده است...
                                                        </div>
                                                    )}
                                                    {!order.admin_notes && (
                                                        <button onClick={() => startEditingNotes(order)} className="absolute inset-0 w-full h-full z-0 cursor-pointer"></button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-card rounded-[2rem] border border-dashed border-border p-16 text-center"
                        >
                            <Search className="w-10 h-10 text-foreground-muted/30 mx-auto mb-4" />
                            <h3 className="font-bold text-lg text-foreground">نتیجه‌ای یافت نشد</h3>
                            <button 
                                onClick={() => { setSearchSearchQuery(""); setStatusFilter("ALL"); }}
                                className="text-primary font-bold text-xs mt-4 underline underline-offset-4"
                            >
                                حذف فیلترها
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

