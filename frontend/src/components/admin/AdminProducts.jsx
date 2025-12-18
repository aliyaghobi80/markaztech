// مسیر: src/components/admin/AdminProducts.jsx
"use client";

import { useState } from "react"; // اضافه شده
import useSWR from "swr";
import api from "@/lib/axios";
import { formatPrice } from "@/lib/utils";
import { Plus, Edit, Trash2, X, Upload, Package, Power, PowerOff } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const fetcher = (url) => api.get(url).then((res) => res.data.results || res.data);

export default function AdminProducts() {
  const { data: products, mutate } = useSWR("/products/", fetcher, { refreshInterval: 5000 });
  const router = useRouter();
  


  const [deleteError, setDeleteError] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm("آیا از حذف این محصول مطمئن هستید؟")) return;
    setDeleteError(null);
    try {
      await api.delete(`/products/${id}/`);
      toast.success("محصول با موفقیت حذف شد");
      mutate();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          (typeof err.response?.data === 'string' && err.response.data.includes('ProtectedError') 
                            ? "این محصول در سفارشات استفاده شده و قابل حذف نیست. به جای حذف، آن را غیرفعال کنید."
                            : "خطا در حذف محصول");
      setDeleteError(errorMessage);
      toast.error(errorMessage, { duration: 5000 });
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await api.patch(`/products/${id}/`, { is_active: !currentStatus });
      toast.success(currentStatus ? "محصول غیرفعال شد" : "محصول فعال شد");
      setDeleteError(null);
      mutate();
    } catch (err) {
      toast.error("خطا در تغییر وضعیت محصول");
    }
  };



  if (!products) return <div className="text-center py-10">در حال بارگذاری محصولات...</div>;

  return (
    <div className="animate-in fade-in zoom-in duration-300 relative">
      
      {deleteError && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">!</div>
            <div className="flex-1">
              <p className="text-amber-800 dark:text-amber-200 font-medium text-sm">{deleteError}</p>
              <p className="text-amber-600 dark:text-amber-300 text-xs mt-1">می‌توانید به جای حذف، محصول را غیرفعال کنید تا در سفارشات قبلی باقی بماند.</p>
            </div>
            <button onClick={() => setDeleteError(null)} className="text-amber-500 hover:text-amber-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* هدر و دکمه افزودن */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-foreground">مدیریت محصولات</h2>
        <button 
            onClick={() => router.push('/admin/products/add')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold flex gap-2 hover:opacity-90 transition"
        >
            <Plus className="w-4 h-4" /> افزودن محصول
        </button>
      </div>

      {/* جدول محصولات */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-right">
              <thead className="bg-secondary text-foreground-muted">
                  <tr>
                      <th className="p-4 font-medium">تصویر</th>
                      <th className="p-4 font-medium">نام محصول</th>
                      <th className="p-4 font-medium">قیمت (تومان)</th>
                      <th className="p-4 font-medium">وضعیت</th>
                      <th className="p-4 text-center font-medium">عملیات</th>
                  </tr>
              </thead>
            <tbody className="divide-y divide-border">
                {products.length === 0 && (
                    <tr><td colSpan="5" className="p-8 text-center text-foreground-muted">محصولی یافت نشد.</td></tr>
                )}
                {products.map((p) => (
                    <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="p-4">
                            {/* نمایش تصویر کوچک اگر وجود دارد */}
                            {p.main_image ? (
                                <img src={p.main_image} alt={p.title} className="w-12 h-12 object-cover rounded-lg border border-border" />
                            ) : (
                                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center text-xs text-foreground-muted border border-border">
                                    <Package className="w-5 h-5" />
                                </div>
                            )}
                        </td>
                        <td className="p-4 font-medium text-foreground">{p.title}</td>
                        <td className="p-4 text-foreground-muted">{formatPrice(p.price)}</td>
                        <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${p.is_active !== false ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                {p.is_active !== false ? 'فعال' : 'غیرفعال'}
                            </span>
                        </td>
                        <td className="p-4 flex justify-center gap-2">
                            <button 
                                onClick={() => router.push(`/admin/products/edit/${p.id}`)}
                                className="text-primary bg-primary/10 p-2 rounded-lg hover:bg-primary/20 transition-colors"
                                title="ویرایش محصول"
                            >
                                <Edit className="w-4 h-4"/>
                            </button>
                            <button 
                                onClick={() => handleToggleActive(p.id, p.is_active !== false)} 
                                className={`p-2 rounded-lg transition-colors ${p.is_active !== false ? 'text-amber-600 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50' : 'text-green-600 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50'}`}
                                title={p.is_active !== false ? 'غیرفعال کردن' : 'فعال کردن'}
                            >
                                {p.is_active !== false ? <PowerOff className="w-4 h-4"/> : <Power className="w-4 h-4"/>}
                            </button>
                            <button 
                                onClick={() => handleDelete(p.id)} 
                                className="text-error bg-error/10 p-2 rounded-lg hover:bg-error/20 transition-colors"
                                title="حذف محصول"
                            >
                                <Trash2 className="w-4 h-4"/>
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>



    </div>
  );
}