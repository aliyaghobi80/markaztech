// مسیر: src/components/admin/AdminArticles.jsx
"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import api from "@/lib/axios";
import { getMediaUrl } from "@/lib/media";
import { Plus, Edit, Trash2, Eye, FileText, Calendar, User } from "lucide-react";
import toast from "react-hot-toast";
import RichTextEditor from "../RichTextEditor";
import EditorGuide from "../EditorGuide";
import ArticlePreview from "../ArticlePreview";

const fetcher = (url) => api.get(url).then((res) => res.data.results || res.data);

export default function AdminArticles() {
  const { data: articles, mutate } = useSWR("/articles/", fetcher);
  const { data: categories } = useSWR("/products/categories/?flat=true", fetcher);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    author_note: '',
    is_active: true
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: '',
      author_note: '',
      is_active: true
    });
    setImage(null);
    setImagePreview(null);
    setEditingArticle(null);
    setShowForm(false);
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      category: article.category?.id || '',
      author_note: article.author_note || '',
      is_active: article.is_active
    });
    setImagePreview(article.image);
    setShowForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Add form fields
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('author_note', formData.author_note);
      submitData.append('is_active', formData.is_active);
      
      if (formData.category) {
        submitData.append('category', formData.category);
      }

      // Add image if selected
      if (image) {
        submitData.append('image', image);
      }

      if (editingArticle) {
        await api.patch(`/articles/${editingArticle.id}/`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("مقاله با موفقیت بروزرسانی شد!");
      } else {
        await api.post('/articles/', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("مقاله با موفقیت ایجاد شد!");
      }

      mutate();
      resetForm();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("خطا در ذخیره مقاله");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("آیا از حذف این مقاله مطمئن هستید؟")) return;
    
    try {
      await api.delete(`/articles/${id}/`);
      toast.success("مقاله با موفقیت حذف شد");
      mutate();
    } catch (error) {
      toast.error("خطا در حذف مقاله");
    }
  };

  if (!articles) return <div className="text-center py-10">در حال بارگذاری مقالات...</div>;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground">مدیریت مقالات</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold flex gap-2 hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" /> افزودن مقاله
        </button>
      </div>

      {/* Article Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold">
                {editingArticle ? 'ویرایش مقاله' : 'افزودن مقاله جدید'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Title and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    عنوان مقاله *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="w-full bg-secondary border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
                    placeholder="عنوان مقاله را وارد کنید"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    دسته‌بندی
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-secondary border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
                  >
                    <option value="">انتخاب دسته‌بندی</option>
                    {categories?.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  تصویر مقاله
                </label>
                
                {imagePreview && (
                  <div className="mb-3">
                    <img 
                      src={getMediaUrl(imagePreview)} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-xl border border-border"
                    />
                  </div>
                )}
                
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                  />
                  <div className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:bg-secondary/30 transition-colors">
                    <FileText className="w-8 h-8 text-foreground-muted mx-auto mb-2" />
                    <p className="text-sm text-foreground-muted">
                      {image ? image.name : 'کلیک کنید یا تصویر را بکشید'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rich Text Editor */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  محتوای مقاله *
                </label>
                
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  placeholder="محتوای مقاله را با استفاده از ویرایشگر TipTap بنویسید..."
                />
              </div>

              {/* Author Note */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  توضیح نویسنده
                </label>
                <textarea
                  value={formData.author_note}
                  onChange={(e) => setFormData(prev => ({ ...prev, author_note: e.target.value }))}
                  rows="3"
                  className="w-full bg-secondary border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                  placeholder="توضیحات اضافی درباره این مقاله..."
                />
              </div>

              {/* Active Status */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="w-5 h-5 text-primary focus:ring-primary rounded"
                  />
                  <span className="text-foreground font-medium">مقاله فعال باشد</span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl font-medium transition-colors"
                >
                  انصراف
                </button>
                
                <ArticlePreview 
                  content={formData.content} 
                  title={formData.title || "پیش‌نمایش مقاله"} 
                />
                
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  {loading ? 'در حال ذخیره...' : (editingArticle ? 'بروزرسانی' : 'ایجاد مقاله')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Articles List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {articles.length === 0 ? (
          <div className="p-8 text-center text-foreground-muted">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>هنوز مقاله‌ای ایجاد نشده است.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {articles.map((article) => (
              <div key={article.id} className="p-6 hover:bg-secondary/30 transition-colors">
                <div className="flex items-start gap-4">
                  
                  {/* Article Image */}
                  <div className="flex-shrink-0">
                    {article.image ? (
                      <img 
                        src={getMediaUrl(article.image)} 
                        alt={article.title}
                        className="w-20 h-20 object-cover rounded-xl border border-border"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-secondary rounded-xl flex items-center justify-center">
                        <FileText className="w-8 h-8 text-foreground-muted" />
                      </div>
                    )}
                  </div>

                  {/* Article Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-foreground text-lg mb-1">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-foreground-muted mb-2">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {article.author_name || article.author?.full_name || article.author?.username || 'نامشخص'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(article.created_at).toLocaleDateString('fa-IR')}
                          </span>
                          {article.category && (
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                              {article.category.name}
                            </span>
                          )}
                        </div>
                        <div 
                          className="text-foreground-muted text-sm line-clamp-2"
                          dangerouslySetInnerHTML={{ 
                            __html: article.content?.replace(/<[^>]*>/g, '').substring(0, 150) + '...' 
                          }}
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          article.is_active 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {article.is_active ? 'فعال' : 'غیرفعال'}
                        </span>
                        
                        <button 
                          onClick={() => handleEdit(article)}
                          className="text-primary bg-primary/10 p-2 rounded-lg hover:bg-primary/20 transition-colors"
                          title="ویرایش مقاله"
                        >
                          <Edit className="w-4 h-4"/>
                        </button>
                        
                        <button 
                          onClick={() => handleDelete(article.id)} 
                          className="text-error bg-error/10 p-2 rounded-lg hover:bg-error/20 transition-colors"
                          title="حذف مقاله"
                        >
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* راهنمای ویرایشگر */}
      <EditorGuide />
    </div>
  );
}