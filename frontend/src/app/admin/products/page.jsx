"use client";

import useSWR from "swr";
import api from "@/lib/axios";
import { formatPrice } from "@/lib/utils";
import { Plus, Edit, Trash2, Search, Package, Power } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useState } from "react";

const fetcher = (url) => api.get(url).then((res) => res.data.results || res.data);

export default function AdminProductsPage() {
  const { data: products, error, mutate } = useSWR("/products/", fetcher, { 
    refreshInterval: 5000
  });
  const [togglingId, setTogglingId] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm("آیا از حذف این محصول مطمئن هستید؟")) return;
    
    try {
      await api.delete(`/products/${id}/`);
      toast.success("محصول حذف شد");
      mutate();
    } catch (err) {
      toast.error("خطا در حذف محصول");
    }
  };

  const handleToggleActive = async (product) => {
    setTogglingId(product.id);
    try {
      await api.patch(`/products/${product.id}/`, {
        is_active: !product.is_active
      });
      toast.success(product.is_active ? "محصول غیرفعال شد" : "محصول فعال شد");
      mutate();
    } catch (err) {
      toast.error("خطا در تغییر وضعیت محصول");
    } finally {
      setTogglingId(null);
    }
  };

  if (!products) return <div className="text-center py-20">در حال بارگذاری لیست محصولات...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
            <h1 className="text-2xl font-black text-foreground">مدیریت محصولات</h1>
            <p className="text-foreground-muted text-sm">لیست تمام محصولات فعال و غیرفعال</p>
        </div>
        
        <Link href="/admin/products/add" className="bg-primary hover:bg-primary-hover text-primary-foreground px-4 sm:px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all text-sm sm:text-base">
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">افزودن محصول جدید</span>
            <span className="sm:hidden">افزودن</span>
        </Link>
      </div>

      {/* Desktop Table */}
      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-secondary border-b border-border">
                        <tr>
                          <th className="px-6 py-4 text-right text-sm font-bold text-foreground-muted">تصویر</th>
                          <th className="px-6 py-4 text-right text-sm font-bold text-foreground-muted">نام محصول</th>
                          <th className="px-6 py-4 text-right text-sm font-bold text-foreground-muted">دسته‌بندی</th>
                          <th className="px-6 py-4 text-right text-sm font-bold text-foreground-muted">قیمت</th>
                          <th className="px-6 py-4 text-right text-sm font-bold text-foreground-muted">وضعیت</th>
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
                                    {product.category?.name}
                                </span>
                            </td>
                              <td className="px-6 py-3 font-bold text-foreground">
                                  {formatPrice(product.price)}
                              </td>
                                <td className="px-6 py-3">
                                    <button
                                        onClick={() => handleToggleActive(product)}
                                        disabled={togglingId === product.id}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                                            product.is_active 
                                            ? 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100' 
                                            : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                                        } ${togglingId === product.id ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                                    >
                                        <Power className={`w-3.5 h-3.5 ${product.is_active ? 'text-green-500' : 'text-red-400'}`} />
                                        {product.is_active ? 'فعال' : 'غیرفعال'}
                                    </button>
                                </td>
                            <td className="px-6 py-3">
                                <div className="flex items-center justify-center gap-2">
                                    <Link href={`/admin/products/edit/${product.id}`} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="ویرایش">
                                        <Edit className="w-4 h-4" />
                                    </Link>
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {products.map((product) => (
          <div key={product.id} className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="w-16 h-16 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
                <img src={product.main_image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground truncate">{product.title}</h3>
                <p className="text-primary font-bold text-sm">{formatPrice(product.price)}</p>
                <span className="inline-block bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold mt-1">
                  {product.category?.name}
                </span>
              </div>
            </div>
            
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <button
                    onClick={() => handleToggleActive(product)}
                    disabled={togglingId === product.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                        product.is_active 
                        ? 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100' 
                        : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                    } ${togglingId === product.id ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                >
                    <Power className={`w-3.5 h-3.5 ${product.is_active ? 'text-green-500' : 'text-red-400'}`} />
                    {product.is_active ? 'فعال' : 'غیرفعال'}
                </button>
              
              <div className="flex items-center gap-1">
                <Link href={`/admin/products/edit/${product.id}`} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </Link>
                <button 
                  onClick={() => handleDelete(product.id)}
                  className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
