"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Package, 
  FileText, 
  Image as ImageIcon,
  Save,
  Loader2
} from "lucide-react";

const fetcher = (url) => api.get(url).then((res) => res.data);

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: product, error, isLoading } = useSWR(id ? `/products/${id}/` : null, fetcher);
  const { data: categories } = useSWR("/products/categories/?flat=true", fetcher);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    discount_price: '',
    delivery_time: 'آنی',
    stock: '10',
    category: '',
    is_active: true,
    show_in_hero: false,
    product_type: 'account'
  });
  
  const [mainImage, setMainImage] = useState(null);
  const [downloadFile, setDownloadFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        description: product.description || '',
        price: product.price || '',
        discount_price: product.discount_price !== null ? product.discount_price : '',
        delivery_time: product.delivery_time || 'آنی',
        stock: product.stock || '10',
        category: product.category?.id || '',
        is_active: product.is_active !== false,
        show_in_hero: product.show_in_hero || false,
        product_type: product.product_type || 'account'
      });
      setMainImagePreview(product.main_image);
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setMainImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDownloadFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      // Add files if selected
      if (mainImage) {
        submitData.append('main_image', mainImage);
      }
      if (downloadFile) {
        submitData.append('download_file', downloadFile);
      }

      await api.patch(`/products/${id}/`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success("محصول با موفقیت بروزرسانی شد!");
      router.push('/admin');
    } catch (error) {
      console.error("Update error:", error);
      toast.error("خطا در بروزرسانی محصول");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-foreground-muted text-sm font-medium">در حال بارگذاری محصول...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Package className="w-16 h-16 text-red-500" />
        <h1 className="text-2xl font-bold text-foreground">محصول یافت نشد!</h1>
        <button 
          onClick={() => router.push('/admin')}
          className="text-primary hover:underline"
        >
          بازگشت به پنل مدیریت
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.push('/admin')}
            className="p-2 hover:bg-secondary rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-foreground">ویرایش محصول</h1>
            <p className="text-foreground-muted">ویرایش اطلاعات محصول "{product.title}"</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Basic Information */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              اطلاعات اصلی
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  عنوان محصول *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-secondary border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  دسته‌بندی *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-secondary border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
                >
                  <option value="">انتخاب دسته‌بندی</option>
                  {categories?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  توضیحات محصول *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full bg-secondary border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                />
              </div>
            </div>
          </div>

          {/* Product Type */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              نوع محصول
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="product_type"
                    value="account"
                    checked={formData.product_type === 'account'}
                    onChange={handleInputChange}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-foreground font-medium">اکانت</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="product_type"
                    value="file"
                    checked={formData.product_type === 'file'}
                    onChange={handleInputChange}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-foreground font-medium">فایل</span>
                </label>
              </div>

              {/* File Upload Section - Only show for file products */}
              {formData.product_type === 'file' && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    فایل قابل دانلود
                  </label>
                  
                  {product.download_file && (
                    <div className="mb-3 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        فایل فعلی: {product.download_file.split('/').pop()}
                      </p>
                      {product.file_type && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          نوع: {product.file_type.toUpperCase()} | حجم: {product.file_size}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleDownloadFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="*/*"
                    />
                    <div className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-4 text-center cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-colors">
                      <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                        {downloadFile ? downloadFile.name : 'کلیک کنید یا فایل را بکشید'}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        تمام فرمت‌های فایل پشتیبانی می‌شود
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">قیمت‌گذاری</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  قیمت اصلی (تومان) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full bg-secondary border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  قیمت با تخفیف (تومان)
                </label>
                <input
                  type="number"
                  name="discount_price"
                  value={formData.discount_price}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full bg-secondary border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="اختیاری"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  موجودی
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full bg-secondary border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              تصویر محصول
            </h3>
            
            <div className="space-y-4">
              {mainImagePreview && (
                <div className="w-32 h-32 bg-secondary rounded-xl border border-border overflow-hidden">
                  <img 
                    src={mainImagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="relative">
                <input
                  type="file"
                  onChange={handleMainImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept="image/*"
                />
                <div className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:bg-secondary/30 transition-colors">
                  <Upload className="w-8 h-8 text-foreground-muted mx-auto mb-2" />
                  <p className="text-sm text-foreground-muted">
                    {mainImage ? mainImage.name : 'کلیک کنید یا تصویر را بکشید'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">تنظیمات</h3>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-primary focus:ring-primary rounded"
                />
                <span className="text-foreground font-medium">محصول فعال باشد</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="show_in_hero"
                  checked={formData.show_in_hero}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-primary focus:ring-primary rounded"
                />
                <span className="text-foreground font-medium">نمایش در اسلایدر اصلی</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl font-medium transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}