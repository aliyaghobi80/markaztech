// مسیر: src/components/admin/AdminOrders.jsx
"use client";

import { useState } from "react";
import useSWR from "swr";
import api from "@/lib/axios";
import { formatPrice } from "@/lib/utils";
import { CheckCircle, XCircle, Edit, Save, X } from "lucide-react";
import toast from "react-hot-toast";

// تابع فچر برای گرفتن دیتا
const fetcher = (url) => api.get(url).then((res) => res.data.results || res.data);

export default function AdminOrders() {
  // آدرس دقیق باید /orders/ باشد (بدون list)
  const { data: orders, error, mutate } = useSWR("/orders/", fetcher);
  const [editingNotes, setEditingNotes] = useState(null);
  const [notesText, setNotesText] = useState("");

  // تغییر وضعیت سفارش
  const changeStatus = async (id, newStatus) => {
    try {
      // ارسال درخواست پچ برای تغییر وضعیت
      await api.patch(`/orders/${id}/`, { status: newStatus });
      toast.success("وضعیت سفارش تغییر کرد");
      mutate(); // رفرش کردن لیست بدون ریلود صفحه
    } catch (err) {
      console.error("Error changing status:", err);
      if (err.response?.data) {
        console.error("Server response:", err.response.data);
      }
      toast.error("خطا در تغییر وضعیت - فقط ادمین اجازه دارد");
    }
  };

  // شروع ویرایش توضیحات
  const startEditingNotes = (order) => {
    setEditingNotes(order.id);
    setNotesText(order.admin_notes || "");
  };

  // ذخیره توضیحات
  const saveNotes = async (orderId) => {
    try {
      await api.patch(`/orders/${orderId}/`, { admin_notes: notesText });
      toast.success("توضیحات ذخیره شد");
      setEditingNotes(null);
      setNotesText("");
      mutate();
    } catch (err) {
      console.error("Error saving notes:", err);
      toast.error("خطا در ذخیره توضیحات");
    }
  };

  // لغو ویرایش
  const cancelEditing = () => {
    setEditingNotes(null);
    setNotesText("");
  };

  if (error) return <div className="text-center py-10 text-red-500">خطا در دریافت سفارشات</div>;
  if (!orders) return <div className="text-center py-10 text-foreground-muted">در حال دریافت لیست سفارشات...</div>;

  return (
    <div className="animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-foreground">مدیریت پرداخت‌ها و سفارشات</h2>
        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
          {orders.length} سفارش
        </span>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-right">
          <thead className="bg-secondary text-foreground-muted">
            <tr>
              <th className="p-4">شماره سفارش</th>
              <th className="p-4">کاربر</th>
              <th className="p-4">مبلغ کل</th>
              <th className="p-4">تاریخ</th>
              <th className="p-4">وضعیت</th>
              <th className="p-4">توضیحات ادمین</th>
              <th className="p-4 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.length === 0 && (
                <tr><td colSpan="7" className="p-8 text-center text-foreground-muted">هیچ سفارشی ثبت نشده است.</td></tr>
            )}
            
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-secondary/30 transition">
                <td className="p-4 font-bold">#{order.id}</td>
                <td className="p-4">
                    <div className="flex flex-col">
                        {/* اینجا چک میکنیم اگر یوزر نبود (پاک شده بود) خطا نده */}
                        <span className="font-medium">{order.user?.full_name || "کاربر ناشناس"}</span>
                        <span className="text-xs text-foreground-muted dir-ltr text-right">{order.user?.mobile}</span>
                    </div>
                </td>
                <td className="p-4 font-bold text-primary">{formatPrice(order.total_price)}</td>
                <td className="p-4 text-foreground-muted">
                    {new Date(order.created_at).toLocaleDateString('fa-IR')}
                </td>
                <td className="p-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="p-4 max-w-xs">
                  {editingNotes === order.id ? (
                    <div className="flex gap-2">
                      <textarea
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        placeholder="توضیحات اکانت و اطلاعات تحویل..."
                        className="flex-1 p-2 border border-border rounded-lg bg-background text-foreground text-xs resize-none"
                        rows="2"
                      />
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => saveNotes(order.id)}
                          className="p-1 bg-success/10 text-success rounded hover:bg-success/20 transition"
                          title="ذخیره"
                        >
                          <Save className="w-3 h-3" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-1 bg-error/10 text-error rounded hover:bg-error/20 transition"
                          title="لغو"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-foreground-muted flex-1 truncate">
                        {order.admin_notes || "بدون توضیحات"}
                      </p>
                      <button
                        onClick={() => startEditingNotes(order)}
                        className="p-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition"
                        title="ویرایش توضیحات"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    {/* دکمه تایید */}
                    <button 
                      onClick={() => changeStatus(order.id, "PAID")}
                      title="تایید پرداخت"
                      className="p-2 bg-success/10 text-success rounded-lg hover:bg-success/20 transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    
                    {/* دکمه رد / لغو */}
                    <button 
                      onClick={() => changeStatus(order.id, "CANCELED")}
                      title="لغو سفارش"
                      className="p-2 bg-error/10 text-error rounded-lg hover:bg-error/20 transition"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    
                    {/* دکمه تحویل */}
                    <button 
                      onClick={() => changeStatus(order.id, "SENT")}
                      title="تحویل داده شد"
                      className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// کامپوننت کوچک برای نمایش رنگی وضعیت
function StatusBadge({ status }) {
    const styles = {
        PENDING: { bg: "bg-warning/10", text: "text-warning", label: "در انتظار پرداخت" },
        PAID: { bg: "bg-success/10", text: "text-success", label: "پرداخت شده" },
        CANCELED: { bg: "bg-error/10", text: "text-error", label: "لغو شده" },
        SENT: { bg: "bg-primary/10", text: "text-primary", label: "تحویل داده شده" },
    };

    const style = styles[status] || { bg: "bg-secondary", text: "text-foreground-muted", label: status };

    return (
        <span className={`px-2 py-1 rounded-md text-xs font-bold ${style.bg} ${style.text}`}>
            {style.label}
        </span>
    );
}