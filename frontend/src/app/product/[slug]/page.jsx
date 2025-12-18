// مسیر: src/app/product/[slug]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { 
  ShoppingCart, ShieldCheck, Zap, Clock, Star, 
  CheckCircle2, AlertCircle, Heart, Share2, Headphones 
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (!slug) return;
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${slug}/`);
        setProduct(response.data);
      } catch (error) {
        console.error("Product not found", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-foreground-muted text-sm font-medium">در حال بارگذاری محصول...</span>
        </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h1 className="text-2xl font-bold text-foreground">محصول یافت نشد!</h1>
        <Link href="/" className="text-primary hover:underline">بازگشت به صفحه اصلی</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8 lg:py-12 transition-colors duration-300">
      <div className="container mx-auto px-4">
        
        {/* نوار مسیر (Breadcrumb) */}
        <nav className="flex items-center gap-2 text-sm text-foreground-muted mb-8 overflow-x-auto whitespace-nowrap pb-2">
          <Link href="/" className="hover:text-primary transition-colors">خانه</Link>
          <span className="text-foreground-muted">/</span>
          <Link href={`/category/${product.category_slug}`} className="hover:text-primary transition-colors">{product.category}</Link>
          <span className="text-foreground-muted">/</span>
          <span className="text-foreground font-medium">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* --- ستون راست: گالری تصویر --- */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
                <div className="relative aspect-square rounded-3xl overflow-hidden bg-secondary border border-border shadow-sm group">
                    <img 
                    src={product.main_image} 
                    alt={product.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* نشان‌های روی عکس */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                        {product.discount_price && (
                            <span className="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl shadow-lg shadow-red-500/20">
                                {calculateDiscount(product.price, product.discount_price)}% تخفیف
                            </span>
                        )}
                    </div>
                </div>
                
                {/* دکمه‌های اشتراک و علاقه */}
                <div className="flex items-center gap-4 justify-center">
                    <button className="flex items-center gap-2 text-foreground-muted hover:text-error transition-colors text-sm font-medium">
                        <Heart className="w-5 h-5" />
                        افزودن به علاقه‌مندی
                    </button>
                    <button className="flex items-center gap-2 text-foreground-muted hover:text-primary transition-colors text-sm font-medium">
                        <Share2 className="w-5 h-5" />
                        اشتراک گذاری
                    </button>
                </div>
            </div>
          </div>

          {/* --- ستون وسط: اطلاعات محصول --- */}
          <div className="lg:col-span-5 space-y-6">
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                        {product.category}
                    </span>
                    <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-foreground-muted text-sm font-medium pt-0.5">(۵.۰)</span>
                    </div>
                </div>
                <h1 className="text-3xl lg:text-4xl font-black text-foreground leading-tight mb-4">
                    {product.title}
                </h1>
                <p className="text-foreground-muted leading-relaxed line-clamp-3">
                    این محصول یکی از بهترین گزینه‌ها برای حرفه‌ای‌هاست. با خرید این اکانت، به تمام قابلیت‌های پریمیوم دسترسی خواهید داشت.
                </p>
            </div>

            {/* ویژگی‌های کلیدی (Mockup) */}
            <div className="border-t border-b border-border py-6 space-y-3">
                <h3 className="font-bold text-foreground mb-2 text-sm">ویژگی‌های برجسته:</h3>
                <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-foreground-muted">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span>تحویل آنی و اتوماتیک پس از پرداخت</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-foreground-muted">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span>قابلیت تمدید قانونی روی ایمیل شخصی</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-foreground-muted">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span>گارانتی کامل تا آخرین روز اشتراک</span>
                    </li>
                </ul>
            </div>

            {/* توضیحات کامل */}
            <div className="bg-secondary/50 rounded-2xl p-4 md:p-6">
                 <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    توضیحات تکمیلی
                </h3>
                <div className="text-foreground-muted text-sm leading-8 whitespace-pre-line">
                    {product.description}
                </div>
            </div>
          </div>

          {/* --- ستون چپ: باکس خرید (Sticky Buy Box) --- */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-none sticky top-24">
                
                {/* قیمت */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-1 text-foreground-muted text-sm">
                        <span>قیمت اصلی:</span>
                        {product.discount_price && (
                            <span className="line-through decoration-red-400 decoration-2">
                                {formatPrice(product.price)}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <span className="text-4xl font-black text-foreground">
                            {formatPrice(product.discount_price || product.price)}
                        </span>
                        <span className="text-sm font-medium text-foreground-muted mt-2">تومان</span>
                    </div>
                </div>

                {/* دکمه خرید */}
                <button 
                    onClick={() => {
                        addToCart(product);
                        toast.success("محصول به سبد خرید اضافه شد");
                    }}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mb-4"
                >
                    <ShoppingCart className="w-6 h-6" />
                    افزودن به سبد خرید
                </button>

                {/* سیگنال‌های اعتماد */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-secondary/50 p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1">
                        <Zap className="w-6 h-6 text-yellow-500" />
                        <span className="text-[10px] font-bold text-foreground-muted">تحویل آنی</span>
                    </div>
                    <div className="bg-secondary/50 p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1">
                        <ShieldCheck className="w-6 h-6 text-success" />
                        <span className="text-[10px] font-bold text-foreground-muted">ضمانت بازگشت</span>
                    </div>
                    <div className="bg-secondary/50 p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1">
                        <Headphones className="w-6 h-6 text-primary" />
                        <span className="text-[10px] font-bold text-foreground-muted">پشتیبانی ۲۴/۷</span>
                    </div>
                    <div className="bg-secondary/50 p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1">
                        <ShieldCheck className="w-6 h-6 text-foreground-muted" />
                        <span className="text-[10px] font-bold text-foreground-muted">پرداخت امن</span>
                    </div>
                </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

