// مسیر: src/app/admin/categories/page.jsx
"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import api from "@/lib/axios";
import { 
  Plus, Search, Edit, Trash2, Loader2,
  LayoutDashboard, ChevronRight, ChevronDown,
  Upload, X, Check, Save
} from "lucide-react";
import toast from "react-hot-toast";

const fetcher = (url) => api.get(url).then((res) => res.data);

export default function AdminCategoriesPage() {
  const { data: categories, mutate, isLoading } = useSWR("/products/categories/?flat=true", fetcher);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsMenuOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parent: "",
    is_active: true
  });
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm("آیا از حذف این دسته‌بندی اطمینان دارید؟")) return;
    try {
      await api.delete(`/products/categories/${id}/`);
      toast.success("دسته‌بندی با موفقیت حذف شد");
      mutate();
    } catch (error) {
      toast.error("خطا در حذف دسته‌بندی (احتمالاً دارای محصول یا زیردسته است)");
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      parent: category.parent || "",
      is_active: category.is_active
    });
    setIconPreview(category.icon);
    setIsMenuOpen(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({ name: "", slug: "", parent: "", is_active: true });
    setIconFile(null);
    setIconPreview(null);
    setIsMenuOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== "" && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });
      if (iconFile) data.append("icon", iconFile);

      if (editingCategory) {
        await api.patch(`/products/categories/${editingCategory.id}/`, data);
        toast.success("تغییرات ذخیره شد");
      } else {
        await api.post("/products/categories/", data);
        toast.success("دسته‌بندی جدید ایجاد شد");
      }
      
      mutate();
      resetForm();
    } catch (error) {
      toast.error("خطا در ذخیره دسته‌بندی");
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = categories?.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">مدیریت دسته‌بندی‌ها</h1>
          <p className="text-foreground-muted text-sm mt-1">ساختار سلسله‌مراتبی محصولات را مدیریت کنید</p>
        </div>
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
        >
          <Plus className="w-5 h-5" />
          دسته‌بندی جدید
        </button>
      </div>

      <div className="bg-card p-4 rounded-3xl border border-border shadow-sm">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
          <input 
            type="text"
            placeholder="جستجو در دسته‌بندی‌ها..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-secondary/50 border-none rounded-2xl pr-12 pl-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all text-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-foreground-muted animate-pulse">در حال دریافت لیست...</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-secondary/30 text-foreground-muted text-xs font-black uppercase tracking-wider">
                <th className="px-6 py-4">آیکون</th>
                <th className="px-6 py-4">نام دسته‌بندی</th>
                <th className="px-6 py-4">اسلاگ</th>
                <th className="px-6 py-4">وضعیت</th>
                <th className="px-6 py-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCategories?.map((cat) => (
                <tr key={cat.id} className="hover:bg-secondary/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center overflow-hidden border border-border">
                      {cat.icon ? (
                        <img src={cat.icon} alt={cat.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <LayoutDashboard className="w-5 h-5 text-foreground-muted" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-foreground">{cat.name}</span>
                    {cat.parent_name && (
                      <div className="flex items-center gap-1 text-[10px] text-foreground-muted mt-1">
                        <span>زیرمجموعه:</span>
                        <span className="bg-secondary px-1.5 py-0.5 rounded-md">{cat.parent_name}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-foreground-muted">{cat.slug}</td>
                  <td className="px-6 py-4">
                    {cat.is_active ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-[10px] font-black">
                        <Check className="w-3 h-3" /> فعال
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error/10 text-error text-[10px] font-black">
                        <X className="w-3 h-3" /> غیرفعال
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleEdit(cat)}
                        className="p-2 bg-secondary hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 bg-secondary hover:bg-error/10 hover:text-error rounded-xl transition-all"
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
      )}

      {/* مودال افزودن/ویرایش */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetForm} />
          <div className="relative bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
              <h2 className="text-xl font-black text-foreground">
                {editingCategory ? "ویرایش دسته‌بندی" : "ایجاد دسته‌بندی جدید"}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-secondary rounded-xl transition-colors text-foreground-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div 
                  className="w-20 h-20 bg-secondary rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 transition-all overflow-hidden relative"
                  onClick={() => document.getElementById("cat-icon").click()}
                >
                  {iconPreview ? (
                    <img src={iconPreview} className="w-full h-full object-contain p-2" alt="icon" />
                  ) : (
                    <Upload className="w-6 h-6 text-foreground-muted" />
                  )}
                  <input 
                    type="file" id="cat-icon" hidden accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setIconFile(file);
                        const reader = new FileReader();
                        reader.onload = (e) => setIconPreview(e.target.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-bold text-foreground">آیکون دسته‌بندی</p>
                  <p className="text-[10px] text-foreground-muted">فرمت SVG یا PNG پیشنهاد می‌شود</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-foreground-muted mb-1.5 block pr-1">نام دسته‌بندی</label>
                  <input 
                    type="text" required
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground-muted mb-1.5 block pr-1">اسلاگ (URL)</label>
                  <input 
                    type="text" required dir="ltr"
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 font-mono text-sm"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground-muted mb-1.5 block pr-1">دسته مادر</label>
                  <select 
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                    value={formData.parent}
                    onChange={(e) => setFormData({...formData, parent: e.target.value})}
                  >
                    <option value="">دسته اصلی (بدون والد)</option>
                    {categories?.filter(c => c.id !== editingCategory?.id).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
                  <input 
                    type="checkbox" id="modal-active" 
                    className="w-5 h-5 accent-primary"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  />
                  <label htmlFor="modal-active" className="text-sm font-bold text-foreground cursor-pointer">نمایش در سایت</label>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit" disabled={saving}
                  className="flex-1 btn-primary py-3.5 rounded-2xl flex items-center justify-center gap-2 font-black shadow-lg shadow-primary/20"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> {editingCategory ? "بروزرسانی" : "ایجاد دسته‌بندی"}</>}
                </button>
                <button
                  type="button" onClick={resetForm}
                  className="flex-1 btn-secondary py-3.5 rounded-2xl font-bold"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
