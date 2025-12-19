// مسیر: src/app/admin/articles/add/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { 
  ArrowRight, Save, Loader2, FileText, 
  Upload, Image as ImageIcon, Tag, 
  Plus, Eye, Sparkles, LayoutDashboard
} from "lucide-react";

export default function AddArticlePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "",
    content: "",
    is_active: true
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // بررسی دسترسی ادمین
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  // بارگذاری دسته‌بندی‌ها
  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/products/categories/?flat=true");
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("حجم فایل نباید بیشتر از 5 مگابایت باشد");
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error("لطفاً تصویر شاخص را انتخاب کنید");
      return;
    }
    setSaving(true);

    try {
      const submitData = new FormData();
      
      // اضافه کردن فیلدهای متنی
      Object.keys(formData).forEach(key => {
        if (formData[key] !== "" && formData[key] !== null) {
          submitData.append(key, formData[key]);
        }
      });

      // اضافه کردن فایل تصویر
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      await api.post("/articles/", submitData);

      toast.success("مقاله جدید با موفقیت منتشر شد");
      router.push("/admin/articles");
    } catch (error) {
      console.error("Error creating article:", error);
      const errorMsg = error.response?.data?.detail || "خطا در ایجاد مقاله";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-secondary py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* هدر */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2.5 bg-card border border-border text-foreground-muted hover:bg-secondary rounded-xl transition-all"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-foreground">افزودن مقاله جدید</h1>
              <p className="text-foreground-muted text-sm mt-1">محتوای جدید برای وبلاگ بنویسید</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button
                type="button"
                onClick={() => window.open(`/articles/${formData.slug}`, '_blank')}
                disabled={!formData.slug}
                className="btn-secondary px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold"
              >
                <Eye className="w-4 h-4" />
                پیش‌نمایش
              </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ستون اصلی */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <form onSubmit={handleSubmit} id="article-form" className="space-y-6">
                {/* عنوان */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground pr-2">عنوان مقاله</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-secondary/50 border border-border rounded-2xl py-4 px-5 outline-none focus:ring-2 focus:ring-primary/20 text-lg font-bold"
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="یک عنوان جذاب بنویسید..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* اسلاگ */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground pr-2">اسلاگ (URL)</label>
                    <div className="relative">
                      <Tag className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                      <input
                        type="text"
                        required
                        className="w-full bg-secondary/50 border border-border rounded-2xl py-3 pr-12 pl-4 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="article-slug-here"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* دسته‌بندی */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground pr-2">دسته‌بندی</label>
                    <div className="relative">
                      <LayoutDashboard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                      <select
                        className="w-full bg-secondary/50 border border-border rounded-2xl py-3 pr-12 pl-4 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium appearance-none"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="">انتخاب دسته‌بندی</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* محتوا */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground pr-2">متن مقاله</label>
                  <textarea
                    rows={15}
                    required
                    className="w-full bg-secondary/50 border border-border rounded-2xl py-4 px-5 outline-none focus:ring-2 focus:ring-primary/20 text-foreground resize-none leading-relaxed"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="داستان خود را اینجا شروع کنید..."
                  />
                </div>
              </form>
            </div>
          </div>

          {/* ستون کناری */}
          <div className="space-y-6">
            {/* تصویر شاخص */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                تصویر شاخص
              </h3>
              <div 
                className="relative aspect-video bg-secondary/50 rounded-2xl border-2 border-dashed border-border overflow-hidden group cursor-pointer hover:border-primary/30 transition-all"
                onClick={() => document.getElementById('image-upload').click()}
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="پیش‌نمایش" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <p className="text-white text-xs font-bold">تغییر تصویر</p>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-foreground-muted">
                    <Upload className="w-8 h-8" />
                    <p className="text-xs font-medium">کلیک کنید یا تصویر را بکشید</p>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <p className="text-[10px] text-foreground-muted mt-3 leading-relaxed">
                فرمت‌های مجاز: JPG, PNG, WebP (حداکثر 5MB). کیفیت تصویر باید بالا باشد.
              </p>
            </div>

            {/* تنظیمات انتشار */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                تنظیمات انتشار
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                  <label htmlFor="is_active" className="text-sm font-medium text-foreground cursor-pointer">نمایش در سایت</label>
                  <input
                    type="checkbox"
                    id="is_active"
                    className="w-5 h-5 accent-primary cursor-pointer"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                </div>
                
                <button
                  form="article-form"
                  type="submit"
                  disabled={saving}
                  className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {saving ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-6 h-6" />
                      انتشار مقاله
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
