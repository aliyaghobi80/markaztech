// مسیر: src/app/admin/products/edit/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { 
  ArrowRight, Save, Loader2, Package, 
  Upload, Image as ImageIcon, Tag, 
  DollarSign, FileText, Clock, Eye
} from "lucide-react";

export default function EditProductPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.id;
  
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    price: "",
    discount_price: "",
    category: "",
    delivery_time: "آنی",
    is_active: true
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // بررسی دسترسی ادمین
  useEffect(() => {
    if (!authLoading && (!user || (!user.is_staff && !user.is_superuser && user.role !== 'ADMIN'))) {
      toast.error("شما دسترسی ادمین ندارید");
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  // بارگذاری اطلاعات محصول و دسته‌بندی‌ها
  useEffect(() => {
    if (productId && user) {
      fetchProductData();
      fetchCategories();
    }
  }, [productId, user]);

  const fetchProductData = async () => {
    try {
      console.log("Fetching product with ID:", productId);
      const response = await api.get(`/products/${productId}/`);
      const productData = response.data;
      
      console.log("Product data received:", productData);
      
      setProduct(productData);
      setFormData({
        title: productData.title || "",
        slug: productData.slug || "",
        description: productData.description || "",
        price: productData.price || "",
        discount_price: productData.discount_price || "",
        category: productData.category?.id || "",
        delivery_time: productData.delivery_time || "آنی",
        is_active: productData.is_active ?? true
      });
      setImagePreview(productData.main_image || null);
    } catch (error) {
      console.error("Error fetching product:", error);
      console.error("Product ID:", productId);
      console.error("Error details:", error.response?.data);
      
      if (error.response?.status === 404) {
          toast.error("محصول یافت نشد");
        } else {
          toast.error("خطا در بارگذاری اطلاعات محصول");
        }
        router.push("/admin/products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/products/categories/");
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
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
      setSaving(true);

      try {
        const submitData = new FormData();
        
        submitData.append('title', formData.title);
        submitData.append('slug', formData.slug);
        submitData.append('description', formData.description);
        submitData.append('price', formData.price);
        if (formData.discount_price) {
          submitData.append('discount_price', formData.discount_price);
        }
        submitData.append('category', formData.category);
        submitData.append('delivery_time', formData.delivery_time);
        submitData.append('is_active', formData.is_active);

        if (imageFile) {
          submitData.append('main_image', imageFile);
        }

        console.log('Submitting form data:', Object.fromEntries(submitData));
        
        const response = await api.patch(`/products/${productId}/`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        console.log('Update response:', response.data);

        toast.success("محصول با موفقیت بروزرسانی شد");
        router.push("/admin/products");
      } catch (error) {
        console.error("Error updating product:", error);
        const errorMsg = error.response?.data?.detail || error.response?.data?.category?.[0] || "خطا در بروزرسانی محصول";
        toast.error(errorMsg);
      } finally {
        setSaving(false);
      }
    };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-foreground-muted opacity-50" />
          <p className="text-foreground-muted">محصول یافت نشد</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* هدر */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 text-foreground-muted hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-foreground">ویرایش محصول</h1>
            <p className="text-foreground-muted">ویرایش اطلاعات محصول: {product.title}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          
          {/* نمایش اطلاعات فعلی */}
          <div className="bg-secondary/30 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-secondary rounded-xl overflow-hidden border-2 border-border flex-shrink-0">
                {product.main_image ? (
                  <img src={product.main_image} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-foreground-muted" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">{product.title}</h3>
                <p className="text-foreground-muted">{product.category?.name}</p>
                <p className="text-primary font-bold">
                  {new Intl.NumberFormat('fa-IR').format(product.price)} تومان
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* آپلود تصویر */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-4">
                تصویر محصول
              </label>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 bg-secondary rounded-xl overflow-hidden border-2 border-dashed border-border flex-shrink-0">
                  {imagePreview ? (
                    <img src={imagePreview} alt="پیش‌نمایش" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-foreground-muted" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="btn-secondary px-4 py-2 rounded-lg cursor-pointer inline-flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    انتخاب تصویر جدید
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-foreground-muted mt-2">
                    فرمت‌های مجاز: JPG, PNG, WebP (حداکثر 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* اطلاعات اصلی */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* عنوان محصول */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  عنوان محصول
                </label>
                <div className="relative">
                  <Package className="absolute right-3 top-3 text-foreground-muted w-5 h-5" />
                  <input
                    type="text"
                    required
                    className="w-full bg-secondary border border-border rounded-xl py-3 pr-10 pl-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="عنوان محصول را وارد کنید"
                  />
                </div>
              </div>

              {/* اسلاگ */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  اسلاگ (URL)
                </label>
                <div className="relative">
                  <Tag className="absolute right-3 top-3 text-foreground-muted w-5 h-5" />
                  <input
                    type="text"
                    required
                    className="w-full bg-secondary border border-border rounded-xl py-3 pr-10 pl-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="product-slug"
                  />
                </div>
              </div>

              {/* دسته‌بندی */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  دسته‌بندی
                </label>
                <select
                  required
                  className="w-full bg-secondary border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
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

              {/* قیمت اصلی */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  قیمت اصلی (تومان)
                </label>
                <div className="relative">
                  <DollarSign className="absolute right-3 top-3 text-foreground-muted w-5 h-5" />
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full bg-secondary border border-border rounded-xl py-3 pr-10 pl-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* قیمت با تخفیف */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  قیمت با تخفیف (اختیاری)
                </label>
                <div className="relative">
                  <DollarSign className="absolute right-3 top-3 text-foreground-muted w-5 h-5" />
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-secondary border border-border rounded-xl py-3 pr-10 pl-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
                    value={formData.discount_price}
                    onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* زمان تحویل */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  زمان تحویل
                </label>
                <div className="relative">
                  <Clock className="absolute right-3 top-3 text-foreground-muted w-5 h-5" />
                  <input
                    type="text"
                    className="w-full bg-secondary border border-border rounded-xl py-3 pr-10 pl-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
                    value={formData.delivery_time}
                    onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                    placeholder="آنی"
                  />
                </div>
              </div>

              {/* وضعیت فعال */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  className="w-4 h-4 text-primary bg-secondary border-border rounded focus:ring-primary"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="is_active" className="text-sm font-medium text-foreground">
                  محصول فعال است
                </label>
              </div>
            </div>

            {/* توضیحات */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                توضیحات محصول
              </label>
              <div className="relative">
                <FileText className="absolute right-3 top-3 text-foreground-muted w-5 h-5" />
                <textarea
                  rows={6}
                  className="w-full bg-secondary border border-border rounded-xl py-3 pr-10 pl-4 outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="توضیحات کامل محصول را وارد کنید..."
                />
              </div>
            </div>

            {/* دکمه‌های عملیات */}
            <div className="flex gap-4 pt-6 border-t border-border">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 btn-primary py-3 rounded-xl flex items-center justify-center gap-2 shadow-theme"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    ذخیره تغییرات
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 btn-secondary py-3 rounded-xl"
              >
                لغو
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}