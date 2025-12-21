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
            'PENDING': 'در انتظار',
            'PAID': 'آماده ارسال',
            'CANCELED': 'لغو شده',
            'SENT': 'تحویل شده'
        };
        const Icons = {
            'PENDING': Clock,
            'PAID': CheckCircle,
            'CANCELED': XCircle,
            'SENT': Truck
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
        const Icon = isWallet ? Wallet : CreditCard;
        const label = order.payment_method_display;

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
        const btnClass = "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 active:scale-95";
        
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
                            تایید پرداخت
                        </button>
                        <button 
                            onClick={() => handleStatusChange(order.id, 'CANCELED')}
                            className={`${btnClass} bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white`}
                        >
                            <XCircle className="w-4 h-4" />
                            رد سفارش
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
                            <Truck className="w-4 h-4" />
                            ارسال شد
                        </button>
                        <button 
                            onClick={() => handleStatusChange(order.id, 'CANCELED')}
                            className={`${btnClass} bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white`}
                        >
                            <XCircle className="w-4 h-4" />
                            لغو
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
                            خروج از ارسال
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
                        بازگردانی
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
                            {s === 'ALL' ? 'همه' : s === 'PENDING' ? 'معلق' : s === 'PAID' ? 'آماده' : s === 'SENT' ? 'ارسال شده' : 'لغو'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            <div className="grid gap-4 pb-20">
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
                                className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden group/card hover:shadow-lg hover:shadow-primary/5 transition-all"
                            >
                                <div className="p-6 md:p-8 flex flex-col xl:flex-row gap-6">
                                    {/* Left: Client Info */}
                                    <div className="flex items-start gap-4 xl:min-w-[280px]">
                                        <div className="w-14 h-14 bg-secondary/50 rounded-2xl flex items-center justify-center font-black text-lg text-foreground shrink-0 border border-border/50">
                                            #{order.id}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-bold text-base text-foreground leading-none">
                                                    {order.user?.full_name || 'کاربر بدون نام'}
                                                </h3>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-[11px] font-medium text-foreground-muted">
                                                    <span className="bg-secondary/50 px-2 py-0.5 rounded-md">{order.user?.mobile}</span>
                                                    <span className="w-1 h-1 bg-border rounded-full"></span>
                                                    <span>{new Date(order.created_at).toLocaleString('fa-IR')}</span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {statusBadge(order.status)}
                                                    {paymentMethodBadge(order)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle: Financials */}
                                    <div className="flex flex-row xl:flex-col items-center xl:items-start justify-between xl:justify-center gap-4 xl:min-w-[180px] xl:border-r xl:border-border/30 xl:pr-6 border-y md:border-y-0 py-4 md:py-0">
                                        <div className="space-y-0.5">
                                            <div className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">مبلغ نهایی</div>
                                            <div className="text-xl font-black text-primary tracking-tight">
                                                {formatPrice(order.total_price)} <span className="text-[10px] font-bold">تومان</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-yellow-500/5 px-2 py-1 rounded-lg">
                                            <Zap className="w-3.5 h-3.5 text-yellow-500" />
                                            <span className="text-[11px] font-bold text-yellow-600">
                                                {order.items?.length || 0} ردیف کالا
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right: Quick Actions */}
                                    <div className="flex-1 flex flex-col justify-center gap-4">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {order.payment_receipt ? (
                                                <div className="flex items-center gap-2">
                                                    <a 
                                                        href={order.payment_receipt} 
                                                        target="_blank" 
                                                        className="flex items-center gap-2 text-primary hover:bg-primary/20 bg-primary/5 px-4 py-2 rounded-xl text-[11px] font-bold transition-all border border-primary/20"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        فیش واریز
                                                    </a>
                                                    <div className="w-10 h-10 rounded-lg border border-border overflow-hidden bg-secondary/30 shrink-0">
                                                        <img 
                                                            src={order.payment_receipt} 
                                                            alt="Receipt" 
                                                            className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
                                                            onClick={() => window.open(order.payment_receipt, '_blank')}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-foreground-muted bg-secondary/30 px-4 py-2 rounded-xl text-[11px] font-bold border border-dashed border-border opacity-70">
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    بدون فیش
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
                                                            toast.success("فاکتور دانلود شد");
                                                        } catch (err) {
                                                            toast.error(err.message);
                                                        } finally {
                                                            btn.disabled = false;
                                                            btn.innerHTML = originalContent;
                                                        }
                                                    }}
                                                    className="flex items-center gap-2 text-emerald-500 hover:bg-emerald-500/20 bg-emerald-500/5 px-4 py-2 rounded-xl text-[11px] font-bold transition-all border border-emerald-500/20"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    فاکتور PDF
                                                </button>
                                            )}
                                        </div>

                                        <div className="h-px bg-border/30 w-full"></div>

                                        <ActionButtons order={order} />
                                    </div>
                                </div>

                                {/* Footer: items & Notes */}
                                <div className="px-6 md:px-8 py-5 border-t border-border/20 bg-secondary/10 flex flex-col gap-4">
                                    {/* Products */}
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">اقلام:</span>
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-1.5 bg-card px-3 py-1 rounded-lg border border-border/50 text-[10px] font-bold shadow-sm">
                                                <span className="text-primary">{item.quantity}×</span>
                                                <span className="text-foreground-secondary">{item.product?.title}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Notes */}
                                    <div className="bg-card/40 rounded-2xl p-4 border border-border/40 group/notes relative">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-foreground-muted uppercase tracking-wider">
                                                <Edit3 className="w-3 h-3 text-primary" />
                                                توضیحات و لایسنس
                                            </div>
                                            {editingNotes !== order.id && (
                                                <button 
                                                    onClick={() => startEditingNotes(order)}
                                                    className="text-primary hover:text-primary-dark opacity-0 group-hover/notes:opacity-100 p-1 transition-all"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                        
                                        {editingNotes === order.id ? (
                                            <div className="space-y-3">
                                                <textarea 
                                                    autoFocus
                                                    value={notesValue}
                                                    onChange={(e) => setNotesValue(e.target.value)}
                                                    placeholder="اطلاعات ارسال یا لایسنس..."
                                                    className="w-full bg-card border border-primary/30 rounded-xl p-3 text-[11px] font-medium outline-none focus:ring-4 focus:ring-primary/5 min-h-[60px] leading-relaxed"
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setEditingNotes(null)} className="text-[10px] font-bold text-foreground-muted">انصراف</button>
                                                    <button 
                                                        onClick={() => handleUpdateNotes(order.id)}
                                                        className="bg-primary text-white px-4 py-1.5 rounded-lg text-[10px] font-bold"
                                                    >
                                                        ذخیره
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-[11px] text-foreground-secondary leading-relaxed font-medium">
                                                {order.admin_notes ? (
                                                    <span className="whitespace-pre-wrap">{order.admin_notes}</span>
                                                ) : (
                                                    <span className="text-foreground-muted/40 italic">برای افزودن توضیحات یا کد لایسنس اینجا کلیک کنید...</span>
                                                )}
                                                {!order.admin_notes && (
                                                    <button onClick={() => startEditingNotes(order)} className="absolute inset-0 w-full h-full z-0"></button>
                                                )}
                                            </div>
                                        )}
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

