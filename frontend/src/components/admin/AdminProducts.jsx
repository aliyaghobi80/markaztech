// مسیر: src/components/admin/AdminProducts.jsx
"use client";

import { useState } from "react"; // اضافه شده
import useSWR from "swr";
import api from "@/lib/axios";
import { formatPrice } from "@/lib/utils";
import { Plus, Edit, Trash2, X, Upload, Package } from "lucide-react"; // آیکون‌های جدید
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const fetcher = (url) => api.get(url).then((res) => res.data.results || res.data);

export default function AdminProducts() {
  const { data: products, mutate } = useSWR("/products/", fetcher, { refreshInterval: 5000 });
  const router = useRouter();
  


  // حذف محصول
  const handleDelete = async (id) => {
    if (!confirm("آیا از حذف این محصول مطمئن هستید؟")) return;
    try {
      await api.delete(`/products/${id}/`);
      toast.success("محصول با موفقیت حذف شد");
      mutate(); // رفرش لیست
    } catch (err) {
      console.error(err);
      toast.error("خطا در حذف محصول");
    }
  };



  if (!products) return <div className="text-center py-10">در حال بارگذاری محصولات...</div>;

  return (
    <div className="animate-in fade-in zoom-in duration-300 relative">
      
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
                    <th className="p-4 text-center font-medium">عملیات</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border">
                {products.length === 0 && (
                    <tr><td colSpan="4" className="p-8 text-center text-foreground-muted">محصولی یافت نشد.</td></tr>
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
                        <td className="p-4 flex justify-center gap-2">
                            <button 
                                onClick={() => router.push(`/admin/products/edit/${p.id}`)}
                                className="text-primary bg-primary/10 p-2 rounded-lg hover:bg-primary/20 transition-colors"
                                title="ویرایش محصول"
                            >
                                <Edit className="w-4 h-4"/>
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