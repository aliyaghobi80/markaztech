"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { 
  ArrowLeft, 
  Upload, 
  Package, 
  FileText, 
  Image as ImageIcon,
  Save,
  Loader2
} from "lucide-react";

const fetcher = (url) => api.get(url).then((res) => res.data);

export default function AddProductPage() {
  const router = useRouter();
  const { data: categories } = useSWR("/products/categories/?flat=true", fetcher);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    discount_price: '',
    delivery_time: 'آنی',
    stock: '10',
    category: '',
    show_in_hero: false,
    product_type: 'account'
  });
  
  const [mainImage, setMainImage] = useState(null);
  const [downloadFile, setDownloadFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

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
      if (downloadFile && formData.product_type === 'file') {
        submitData.append('download_file', downloadFile);
      }

      await api.post('/products/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success("محصول با موفقیت اضافه شد!");
      router.push('/admin');
    } catch (error) {
      console.error("Create error:", error);
      toast.error("خطا در ایجاد محصول");
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl font-black text-foreground">افزودن محصول جدید</h1>
            <p className="text-foreground-muted">ایجاد محصول جدید در فروشگاه</p>
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
                  placeholder="نام محصول را وارد کنید"
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
                  placeholder="توضیحات کاملی از محصول ارائه دهید"
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
                    فایل قابل دانلود *
                  </label>
                  
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleDownloadFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="*/*"
                      required={formData.product_type === 'file'}
                    />
                    <div className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-4 text-center cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-colors">
                      <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                        {downloadFile ? downloadFile.name : 'کلیک کنید یا فایل را بکشید'}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        تمام فرمت‌های فایل پشتیبانی می‌شود (عکس، موسیقی، زیپ، PDF و...)
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
                  placeholder="0"
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
                  placeholder="اختیاری - برای رایگان 0 وارد کنید"
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
              {loading ? 'در حال ایجاد...' : 'ایجاد محصول'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}