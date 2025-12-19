// مسیر: src/app/admin/articles/page.jsx
"use client";

import { useState } from "react";
import useSWR from "swr";
import api from "@/lib/axios";
import { 
  Plus, Search, Edit, Trash2, Eye, 
  Calendar, User, FileText, Loader2,
  CheckCircle, XCircle
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

const fetcher = (url) => api.get(url).then((res) => res.data);

export default function AdminArticlesPage() {
  const { data: articles, mutate, isLoading } = useSWR("/articles/", fetcher);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = async (id) => {
    if (!confirm("آیا از حذف این مقاله اطمینان دارید؟")) return;
    try {
      await api.delete(`/articles/${id}/`);
      toast.success("مقاله با موفقیت حذف شد");
      mutate();
    } catch (error) {
      toast.error("خطا در حذف مقاله");
    }
  };

  const filteredArticles = articles?.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* هدر صفحه */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">مدیریت مقالات</h1>
          <p className="text-foreground-muted text-sm mt-1">ایجاد، ویرایش و مدیریت محتوای وبلاگ</p>
        </div>
        <Link 
          href="/admin/articles/add" 
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
        >
          <Plus className="w-5 h-5" />
          مقاله جدید
        </Link>
      </div>

      {/* ابزارهای فیلتر */}
      <div className="bg-card p-4 rounded-3xl border border-border shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
          <input 
            type="text"
            placeholder="جستجو در عنوان مقالات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-secondary/50 border-none rounded-2xl pr-12 pl-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all text-sm"
          />
        </div>
      </div>

      {/* لیست مقالات */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-foreground-muted animate-pulse">در حال دریافت مقالات...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredArticles?.length > 0 ? (
            filteredArticles.map((article) => (
              <div 
                key={article.id} 
                className="bg-card p-4 rounded-3xl border border-border shadow-sm hover:border-primary/30 transition-all group"
              >
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  {/* تصویر شاخص */}
                  <div className="w-full md:w-40 h-32 rounded-2xl overflow-hidden bg-secondary flex-shrink-0 relative">
                    {article.image ? (
                      <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-foreground-muted italic text-xs text-center p-2">
                        بدون تصویر
                      </div>
                    )}
                  </div>

                  {/* اطلاعات مقاله */}
                  <div className="flex-1 min-w-0 text-center md:text-right w-full">
                    <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm text-foreground-muted">
                      <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1 rounded-xl">
                        <User className="w-4 h-4 text-primary" />
                        {article.author_name || "ادمین"}
                      </div>
                      <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1 rounded-xl">
                        <Calendar className="w-4 h-4 text-primary" />
                        {new Date(article.created_at).toLocaleDateString('fa-IR')}
                      </div>
                      <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1 rounded-xl">
                        <FileText className="w-4 h-4 text-primary" />
                        {article.category_name || "بدون دسته‌بندی"}
                      </div>
                    </div>
                  </div>

                  {/* عملیات */}
                  <div className="flex items-center gap-2 w-full md:w-auto justify-center">
                    <Link 
                      href={`/articles/${article.slug}`} 
                      target="_blank"
                      className="p-3 bg-secondary hover:bg-primary/10 hover:text-primary rounded-2xl transition-all"
                      title="مشاهده در سایت"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    <Link 
                      href={`/admin/articles/edit/${article.id}`} 
                      className="p-3 bg-secondary hover:bg-blue-500/10 hover:text-blue-500 rounded-2xl transition-all"
                      title="ویرایش"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(article.id)}
                      className="p-3 bg-secondary hover:bg-error/10 hover:text-error rounded-2xl transition-all"
                      title="حذف"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-card p-20 rounded-3xl border border-dashed border-border text-center">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-foreground-muted" />
              </div>
              <h3 className="text-xl font-bold text-foreground">مقاله‌ای یافت نشد</h3>
              <p className="text-foreground-muted mt-2">هیچ مقاله‌ای با این مشخصات وجود ندارد یا هنوز مقاله‌ای ثبت نشده است.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
