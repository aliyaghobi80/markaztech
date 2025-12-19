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
            'PENDING': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            'PAID': 'bg-green-500/10 text-green-500 border-green-500/20',
            'CANCELED': 'bg-red-500/10 text-red-500 border-red-500/20',
            'SENT': 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        };
        const labels = {
            'PENDING': 'در انتظار پرداخت',
            'PAID': 'پرداخت شده',
            'CANCELED': 'لغو شده',
            'SENT': 'ارسال شده'
        };
        const Icons = {
            'PENDING': Clock,
            'PAID': CheckCircle,
            'CANCELED': XCircle,
            'SENT': Truck
        };
        const Icon = Icons[status] || AlertCircle;

        return (
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter ${styles[status]}`}>
                <Icon className="w-3 h-3" />
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
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter bg-secondary/50 text-foreground-muted border-border/50`}>
                <Icon className="w-3 h-3 opacity-70" />
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
        const btnClass = "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50";
        
        return (
            <div className="flex flex-wrap items-center gap-2">
                {/* Transitions from PENDING */}
                {order.status === 'PENDING' && (
                    <>
                        <button 
                            onClick={() => handleStatusChange(order.id, 'PAID')}
                            className={`${btnClass} bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20`}
                        >
                            <CheckCircle className="w-3.5 h-3.5" />
                            تایید و پرداخت
                        </button>
                        <button 
                            onClick={() => handleStatusChange(order.id, 'CANCELED')}
                            className={`${btnClass} bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white`}
                        >
                            <XCircle className="w-3.5 h-3.5" />
                            رد سفارش
                        </button>
                    </>
                )}

                {/* Transitions from PAID */}
                {order.status === 'PAID' && (
                    <>
                        <button 
                            onClick={() => handleStatusChange(order.id, 'SENT')}
                            className={`${btnClass} bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20`}
                        >
                            <Truck className="w-3.5 h-3.5" />
                            علامت به عنوان ارسال شده
                        </button>
                        <button 
                            onClick={() => handleStatusChange(order.id, 'CANCELED')}
                            className={`${btnClass} bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white`}
                        >
                            <XCircle className="w-3.5 h-3.5" />
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
                            <RotateCcw className="w-3.5 h-3.5" />
                            بازگشت به پرداخت شده
                        </button>
                    </>
                )}

                {/* Transitions from CANCELED */}
                {order.status === 'CANCELED' && (
                    <button 
                        onClick={() => handleStatusChange(order.id, 'PENDING')}
                        className={`${btnClass} bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white`}
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        بازگردانی به انتظار
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">مدیریت سفارش‌ها</h1>
                    <p className="text-foreground-muted text-sm mt-1">کنترل وضعیت تراکنش‌ها و تحویل محصولات</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-card p-1.5 rounded-2xl border border-border shadow-sm">
                        <div className="px-4 py-2 bg-primary/10 rounded-xl text-primary font-black text-xs">
                            {orders.length} کل
                        </div>
                        <div className="px-4 py-2 bg-yellow-500/10 rounded-xl text-yellow-500 font-black text-xs">
                            {orders.filter(o => o.status === 'PENDING').length} معلق
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted group-focus-within:text-primary transition-colors" />
                    <input 
                        type="text" 
                        placeholder="جستجو بر اساس نام، شناسه یا موبایل..."
                        value={searchQuery}
                        onChange={(e) => setSearchSearchQuery(e.target.value)}
                        className="w-full bg-card border border-border rounded-2xl py-3.5 pr-12 pl-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium shadow-sm"
                    />
                </div>
                
                <div className="flex items-center gap-2 bg-card border border-border rounded-2xl p-1.5 shadow-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {['ALL', 'PENDING', 'PAID', 'SENT', 'CANCELED'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                                statusFilter === s 
                                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                : 'text-foreground-muted hover:bg-secondary/50'
                            }`}
                        >
                            {s === 'ALL' ? 'همه' : s === 'PENDING' ? 'معلق' : s === 'PAID' ? 'پرداخت شده' : s === 'SENT' ? 'ارسال شده' : 'لغو شده'}
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
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                key={order.id} 
                                className="bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden group hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all"
                            >
                                <div className="p-8 flex flex-col xl:flex-row gap-8">
                                    {/* Order Info */}
                                    <div className="flex items-start gap-5 min-w-[300px]">
                                        <div className="w-16 h-16 bg-gradient-to-br from-secondary to-border rounded-[1.5rem] flex items-center justify-center font-black text-xl text-foreground shadow-inner border border-white/5 shrink-0">
                                            #{order.id}
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-black text-lg text-foreground tracking-tight">
                                                    {order.user?.full_name || 'کاربر بدون نام'}
                                                </h3>
                                                {statusBadge(order.status)}
                                                {paymentMethodBadge(order)}
                                            </div>
                                            <div className="flex items-center gap-3 text-sm font-medium text-foreground-muted">
                                                <span className="bg-secondary/50 px-2 py-0.5 rounded-lg">{order.user?.mobile}</span>
                                                <span className="w-1 h-1 bg-border rounded-full"></span>
                                                <span>{new Date(order.created_at).toLocaleString('fa-IR')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price & Items Summary */}
                                    <div className="flex flex-col md:flex-row xl:flex-col justify-center gap-6 xl:min-w-[200px] xl:border-r xl:border-border/50 xl:pr-8">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black text-foreground-muted uppercase tracking-widest">مبلغ کل سفارش</div>
                                            <div className="text-2xl font-black text-primary tracking-tighter">
                                                {formatPrice(order.total_price)} <span className="text-sm">تومان</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-yellow-500" />
                                            <span className="text-xs font-bold text-foreground-muted">
                                                {order.items?.length || 0} ردیف محصول
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions & Receipt */}
                                    <div className="flex-1 flex flex-col justify-center gap-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            {order.payment_receipt ? (
                                                <div className="flex items-center gap-3">
                                                    <a 
                                                        href={order.payment_receipt} 
                                                        target="_blank" 
                                                        className="flex items-center gap-2 text-primary hover:bg-primary/20 bg-primary/10 px-5 py-3 rounded-2xl text-xs font-black transition-all border border-primary/10 group/receipt relative overflow-hidden"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        مشاهده فیش واریزی
                                                        
                                                        {/* Simple hover preview if it's an image */}
                                                        <div className="absolute inset-0 bg-primary opacity-0 group-hover/receipt:opacity-5 transition-opacity" />
                                                    </a>
                                                    
                                                    {/* Small thumbnail for quick reference */}
                                                    <div className="w-12 h-12 rounded-xl border border-border overflow-hidden bg-secondary/30 shrink-0">
                                                        <img 
                                                            src={order.payment_receipt} 
                                                            alt="Receipt" 
                                                            className="w-full h-full object-cover hover:scale-110 transition-transform cursor-zoom-in"
                                                            onClick={() => window.open(order.payment_receipt, '_blank')}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-foreground-muted bg-secondary/30 px-5 py-3 rounded-2xl text-xs font-bold italic border border-dashed border-border">
                                                    <XCircle className="w-4 h-4 opacity-50" />
                                                    فیش آپلود نشده
                                                </div>
                                            )}
                                            
                                            {order.status !== 'CANCELED' && (
                                                <button 
                                                    onClick={async (e) => {
                                                        const btn = e.currentTarget;
                                                        const originalContent = btn.innerHTML;
                                                        try {
                                                            btn.disabled = true;
                                                            btn.innerHTML = '<span class="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>';
                                                            await downloadOrderPDF(order);
                                                            toast.success("فاکتور آماده دانلود شد");
                                                        } catch (err) {
                                                            toast.error(err.message);
                                                        } finally {
                                                            btn.disabled = false;
                                                            btn.innerHTML = originalContent;
                                                        }
                                                    }}
                                                    className="flex items-center gap-2 text-green-500 hover:bg-green-500/20 bg-green-500/10 px-5 py-3 rounded-2xl text-xs font-black transition-all border border-green-500/10 disabled:opacity-50"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    دریافت فاکتور PDF
                                                </button>
                                            )}
                                        </div>

                                        <div className="h-px bg-border/50 w-full hidden md:block"></div>

                                        <ActionButtons order={order} />
                                    </div>
                                </div>

                                {/* Admin Notes & Products Detail */}
                                <div className="px-8 pb-8 pt-0 border-t border-border/30 bg-secondary/5 space-y-6">
                                    {/* Products list */}
                                    <div className="flex flex-wrap gap-3 items-center pt-6">
                                        <span className="text-[10px] font-black text-foreground-muted uppercase tracking-widest flex items-center gap-1.5">
                                            <Zap className="w-3 h-3" />
                                            محصولات خریداری شده:
                                        </span>
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-card px-4 py-1.5 rounded-xl border border-border/50 text-[11px] font-bold shadow-sm">
                                                <span className="text-primary">{item.quantity}x</span>
                                                <span className="text-foreground-secondary">{item.product?.title}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Admin Notes Section */}
                                    <div className="bg-card/50 rounded-3xl p-5 border border-border/50 group/notes relative">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-foreground-muted uppercase tracking-widest">
                                                <Edit3 className="w-3 h-3 text-primary" />
                                                توضیحات ادمین (اطلاعات تحویل، لایسنس و ...)
                                            </div>
                                            {editingNotes !== order.id && (
                                                <button 
                                                    onClick={() => startEditingNotes(order)}
                                                    className="text-primary hover:text-primary-dark transition-colors opacity-0 group-hover/notes:opacity-100 p-1 bg-primary/10 rounded-lg"
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
                                                    placeholder="اطلاعات اکانت یا کدهای لایسنس را اینجا وارد کنید..."
                                                    className="w-full bg-card border border-primary/30 rounded-xl p-4 text-xs font-medium outline-none focus:ring-4 focus:ring-primary/5 min-h-[80px] leading-relaxed shadow-inner"
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => setEditingNotes(null)}
                                                        className="px-4 py-2 text-[10px] font-black text-foreground-muted hover:text-foreground"
                                                    >
                                                        انصراف
                                                    </button>
                                                    <button 
                                                        onClick={() => handleUpdateNotes(order.id)}
                                                        className="flex items-center gap-1.5 bg-primary text-white px-5 py-2 rounded-xl text-[10px] font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                                                    >
                                                        <Save className="w-3 h-3" />
                                                        ذخیره توضیحات
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-xs text-foreground-secondary leading-relaxed font-medium min-h-[20px] flex items-center">
                                                {order.admin_notes ? (
                                                    <span className="whitespace-pre-wrap">{order.admin_notes}</span>
                                                ) : (
                                                    <span className="text-foreground-muted/50 italic">بدون توضیح... برای ثبت کلیک کنید.</span>
                                                )}
                                                {/* Clickable area if empty */}
                                                {!order.admin_notes && (
                                                    <button onClick={() => startEditingNotes(order)} className="absolute inset-0 w-full h-full cursor-pointer z-0"></button>
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
                            className="bg-card rounded-[2.5rem] border border-dashed border-border p-20 text-center space-y-4"
                        >
                            <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mx-auto">
                                <Search className="w-8 h-8 text-foreground-muted" />
                            </div>
                            <div>
                                <h3 className="font-black text-xl text-foreground">سفارشی یافت نشد</h3>
                                <p className="text-foreground-muted text-sm mt-1">با فیلترهای فعلی هیچ موردی پیدا نکردیم.</p>
                            </div>
                            <button 
                                onClick={() => { setSearchSearchQuery(""); setStatusFilter("ALL"); }}
                                className="text-primary font-black text-xs hover:underline underline-offset-8"
                            >
                                پاک کردن همه فیلترها
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

