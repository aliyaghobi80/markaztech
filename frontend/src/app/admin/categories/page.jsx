// مسیر: src/app/admin/categories/page.jsx
"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import api from "@/lib/axios";
import { 
  Plus, Search, Edit, Trash2, Loader2,
  LayoutDashboard, ChevronRight, ChevronDown,
  Upload, X, Check, Save, FolderPlus, Folder,
  MoreVertical, ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";

const fetcher = (url) => api.get(url).then((res) => res.data);

export default function AdminCategoriesPage() {
  const { data: categories, mutate, isLoading } = useSWR("/products/categories/", fetcher);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parent: "",
    is_active: true
  });
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleDelete = async (id) => {
    if (!confirm("آیا از حذف این دسته‌بندی اطمینان دارید؟ همه زیردسته‌ها نیز ممکن است تحت تاثیر قرار گیرند.")) return;
    try {
      await api.delete(`/products/categories/${id}/`);
      toast.success("دسته‌بندی با موفقیت حذف شد");
      mutate();
    } catch (error) {
      toast.error("خطا در حذف دسته‌بندی");
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
    setIsModalOpen(true);
  };

  const handleAddSub = (parent) => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      parent: parent.id,
      is_active: true
    });
    setIconPreview(null);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({ name: "", slug: "", parent: "", is_active: true });
    setIconFile(null);
    setIconPreview(null);
    setIsModalOpen(false);
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
        console.error("Error saving category:", error);
        if (error.response?.data) {
          const data = error.response.data;
          if (typeof data === 'object') {
            Object.keys(data).forEach(key => {
              const messages = Array.isArray(data[key]) ? data[key] : [data[key]];
              messages.forEach(msg => toast.error(`${key}: ${msg}`));
            });
          } else {
            toast.error(data.detail || "خطا در ذخیره دسته‌بندی");
          }
        } else {
          toast.error("خطا در ارتباط با سرور");
        }
      } finally {
      setSaving(false);
    }
  };

  // کامپوننت ردیف درختی
  const CategoryRow = ({ category, level = 0 }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedItems.has(category.id);
    const paddingRight = level * 32;

    return (
      <>
        <div className="group flex items-center gap-4 p-3 hover:bg-secondary/20 border-b border-border/50 transition-all">
          <div style={{ width: `${paddingRight}px` }} className="flex-shrink-0" />
          
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button 
              onClick={() => toggleExpand(category.id)}
              className={`p-1 hover:bg-secondary rounded-md transition-all ${!hasChildren ? 'opacity-0 cursor-default' : ''}`}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center overflow-hidden border border-border flex-shrink-0">
              {category.icon ? (
                <img src={category.icon} alt={category.name} className="w-full h-full object-contain p-1.5" />
              ) : (
                <Folder className={`w-5 h-5 ${hasChildren ? 'text-primary' : 'text-foreground-muted'}`} />
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-bold text-foreground truncate">{category.name}</span>
              <span className="text-[10px] text-foreground-muted font-mono">{category.slug}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!category.is_active && (
              <span className="px-2 py-0.5 rounded-full bg-error/10 text-error text-[10px] font-black">غیرفعال</span>
            )}
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleAddSub(category)}
                title="افزودن زیردسته"
                className="p-2 text-foreground-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleEdit(category)}
                title="ویرایش"
                className="p-2 text-foreground-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDelete(category.id)}
                title="حذف"
                className="p-2 text-foreground-muted hover:text-error hover:bg-error/10 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="animate-in slide-in-from-top-1 duration-200">
            {category.children.map(child => (
              <CategoryRow key={child.id} category={child} level={level + 1} />
            ))}
          </div>
        )}
      </>
    );
  };

    // گرفتن لیست مسطح برای انتخاب والد با نام کامل مسیر
    const getFlatCategories = (items, level = 0, path = "") => {
      let flat = [];
      items?.forEach(item => {
        const fullPath = path ? `${path} > ${item.name}` : item.name;
        flat.push({ ...item, level, fullPath });
        if (item.children) {
          flat = [...flat, ...getFlatCategories(item.children, level + 1, fullPath)];
        }
      });
      return flat;
    };

    const allFlatCategories = getFlatCategories(categories);

    // پیدا کردن نام والد فعلی برای نمایش در مودال
    const currentParent = allFlatCategories.find(c => c.id === formData.parent);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* هدر */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-primary" />
            مدیریت دسته‌بندی‌ها
          </h1>
          <p className="text-foreground-muted text-sm mt-2 max-w-md">
            ساختار درختی محتوا و محصولات خود را مدیریت کنید. می‌توانید تا چندین سطح زیردسته ایجاد کنید.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-6 h-6" />
          ایجاد دسته‌بندی اصلی
        </button>
      </div>

      {/* ابزارها */}
      <div className="bg-card p-4 rounded-3xl border border-border shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
          <input 
            type="text"
            placeholder="جستجو در نام یا اسلاگ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-secondary/50 border-none rounded-2xl pr-12 pl-4 py-3.5 focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold"
          />
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setExpandedItems(new Set(categories?.map(c => c.id)))}
            className="px-4 py-2 text-xs font-bold text-primary hover:bg-primary/10 rounded-xl transition-all"
          >
            باز کردن همه
          </button>
          <button 
            onClick={() => setExpandedItems(new Set())}
            className="px-4 py-2 text-xs font-bold text-foreground-muted hover:bg-secondary rounded-xl transition-all"
          >
            بستن همه
          </button>
        </div>
      </div>

      {/* لیست درختی */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6 bg-card rounded-3xl border border-border">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse" />
          </div>
          <p className="text-foreground-muted font-bold animate-pulse">در حال سازمان‌دهی درخت دسته‌ها...</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm min-h-[400px]">
          <div className="bg-secondary/30 px-6 py-4 flex items-center justify-between border-b border-border">
            <span className="text-xs font-black text-foreground-muted uppercase tracking-widest">ساختار دسته‌بندی</span>
            <span className="text-[10px] text-foreground-muted font-bold bg-card px-2 py-1 rounded-lg">
              تعداد کل: {allFlatCategories.length}
            </span>
          </div>
          
          <div className="divide-y divide-border/30">
            {categories && categories.length > 0 ? (
              categories.map(cat => (
                <CategoryRow key={cat.id} category={cat} />
              ))
            ) : (
              <div className="py-20 text-center space-y-4">
                <Folder className="w-12 h-12 text-foreground-muted mx-auto opacity-20" />
                <p className="text-foreground-muted font-medium">هیچ دسته‌بندی یافت نشد.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* مودال افزودن/ویرایش */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-300" onClick={resetForm} />
          <div className="relative bg-card border border-border w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            <div className="p-8 border-b border-border flex items-center justify-between bg-secondary/10">
                <div>
                  <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
                    {editingCategory ? <Edit className="text-primary" /> : <Plus className="text-primary" />}
                    {editingCategory ? "ویرایش دسته‌بندی" : "ایجاد دسته‌بندی جدید"}
                  </h2>
                  {currentParent && !editingCategory && (
                    <p className="text-primary text-[10px] font-black mt-1 flex items-center gap-1">
                      <FolderPlus className="w-3 h-3" />
                      در حال افزودن به: {currentParent.fullPath}
                    </p>
                  )}
                  <p className="text-foreground-muted text-[10px] mt-1">مشخصات دسته را وارد کنید</p>
                </div>
              <button onClick={resetForm} className="p-3 hover:bg-secondary rounded-2xl transition-all text-foreground-muted hover:rotate-90">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="flex items-center gap-6">
                <div 
                  className="w-24 h-24 bg-secondary/50 rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 hover:bg-secondary transition-all overflow-hidden group relative"
                  onClick={() => document.getElementById("cat-icon").click()}
                >
                  {iconPreview ? (
                    <>
                      <img src={iconPreview} className="w-full h-full object-contain p-3" alt="icon" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-2">
                      <Upload className="w-8 h-8 text-foreground-muted mx-auto mb-1 group-hover:text-primary transition-colors" />
                      <span className="text-[9px] font-bold text-foreground-muted">آیکون</span>
                    </div>
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
                <div className="flex-1 space-y-2">
                  <div className="space-y-1">
                    <label className="text-sm font-black text-foreground pr-1">نام دسته‌بندی</label>
                    <input 
                      type="text" required
                      className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-primary/20 font-bold transition-all"
                      value={formData.name}
                      placeholder="مثلاً: ابزارهای هوش مصنوعی"
                      onChange={(e) => {
                        const name = e.target.value;
                        const slug = name.toLowerCase()
                          .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
                          .replace(/\s+/g, '-')
                          .trim();
                        setFormData({...formData, name, slug});
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-black text-foreground pr-1">اسلاگ (URL)</label>
                  <input 
                    type="text" required dir="ltr"
                    className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-primary/20 font-mono text-sm"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-black text-foreground pr-1">دسته مادر</label>
                  <select 
                    className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-primary/20 font-bold appearance-none"
                    value={formData.parent}
                    onChange={(e) => setFormData({...formData, parent: e.target.value})}
                  >
                    <option value="">دسته اصلی (ریشه)</option>
                      {allFlatCategories
                        ?.filter(c => c.id !== editingCategory?.id)
                        .map(c => (
                          <option key={c.id} value={c.id}>
                            {c.fullPath}
                          </option>
                        ))
                      }
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${formData.is_active ? 'bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-error'}`} />
                  <label htmlFor="modal-active" className="text-sm font-bold text-foreground cursor-pointer">نمایش در سایت</label>
                </div>
                <input 
                  type="checkbox" id="modal-active" 
                  className="w-6 h-6 accent-primary cursor-pointer"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="submit" disabled={saving}
                  className="flex-[2] bg-primary text-primary-foreground py-4 rounded-2xl flex items-center justify-center gap-2 font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-6 h-6" /> 
                      {editingCategory ? "ذخیره تغییرات" : "ایجاد دسته‌بندی"}
                    </>
                  )}
                </button>
                <button
                  type="button" onClick={resetForm}
                  className="flex-1 bg-secondary text-foreground font-bold py-4 rounded-2xl hover:bg-secondary-hover transition-all"
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
