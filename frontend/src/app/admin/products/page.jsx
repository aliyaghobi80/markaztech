// مسیر: src/app/admin/products/page.jsx
"use client";

import useSWR from "swr"; // کتابخانه جادویی ریل‌تایم
import api from "@/lib/axios";
import { formatPrice } from "@/lib/utils";
import { Plus, Edit, Trash2, Search, Package } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

// تابع Fetcher برای SWR
const fetcher = (url) => api.get(url).then((res) => res.data.results || res.data);

export default function AdminProductsPage() {
  // این خط معجزه می‌کند: هر وقت دیتا سمت سرور عوض شود، اینجا هم عوض می‌شود
  // refreshInterval: 1000 یعنی هر ۱ ثانیه چک کن (برای حس ریل‌تایم بودن)
  const { data: products, error, mutate } = useSWR("/products/list/", fetcher, { 
    refreshInterval: 5000 // هر 5 ثانیه آپدیت خودکار
  });

  const handleDelete = async (id) => {
    if (!confirm("آیا از حذف این محصول مطمئن هستید؟")) return;
    
    try {
      await api.delete(`/products/list/${id}/`); // نیاز به تنظیم ViewSet در جنگو دارد
      toast.success("محصول حذف شد");
      mutate(); // رفرش آنی لیست بدون ریلود صفحه
    } catch (err) {
      toast.error("خطا در حذف محصول");
    }
  };

  if (!products) return <div className="text-center py-20">در حال بارگذاری لیست محصولات...</div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
            <h1 className="text-2xl font-black text-foreground">مدیریت محصولات</h1>
            <p className="text-foreground-muted text-sm">لیست تمام محصولات فعال و غیرفعال</p>
        </div>
        
        <button className="bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
            <Plus className="w-5 h-5" />
            افزودن محصول جدید
        </button>
      </div>

      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-secondary border-b border-border">
                    <tr>
                        <th className="px-6 py-4 text-right text-sm font-bold text-foreground-muted">تصویر</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-foreground-muted">نام محصول</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-foreground-muted">دسته‌بندی</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-foreground-muted">قیمت</th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-foreground-muted">عملیات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {products.map((product) => (
                        <tr key={product.id} className="hover:bg-secondary/50 transition-colors">
                            <td className="px-6 py-3">
                                <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden">
                                    <img src={product.main_image} alt="" className="w-full h-full object-cover" />
                                </div>
                            </td>
                            <td className="px-6 py-3 font-medium text-foreground">
                                {product.title}
                            </td>
                            <td className="px-6 py-3">
                                <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-bold">
                                    {product.category}
                                </span>
                            </td>
                            <td className="px-6 py-3 font-bold text-foreground">
                                {formatPrice(product.price)}
                            </td>
                            <td className="px-6 py-3">
                                <div className="flex items-center justify-center gap-2">
                                    <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="ویرایش">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(product.id)}
                                        className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors" title="حذف"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}