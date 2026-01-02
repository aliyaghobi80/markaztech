// مسیر: src/app/product/[slug]/page.jsx
"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import api from "@/lib/axios";
import { formatPrice, calculateDiscount, getImageUrl } from "@/lib/utils";
import { 
  ShoppingCart, ShieldCheck, Zap, Clock, Star, 
  CheckCircle2, AlertCircle, Heart, Share2, Headphones 
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import FavoriteToggle from "@/components/FavoriteToggle";
import CommentsSection from "@/components/CommentsSection";

const fetcher = (url) => api.get(url).then((res) => res.data);

export default function ProductPage() {
  const { slug } = useParams();
  const { data: product, error, isLoading, mutate } = useSWR(slug ? `/products/${slug}/` : null, fetcher);
    const { addToCart } = useCart();
    const isOutOfStock = product?.stock === 0;
    const isLowStock = product?.stock > 0 && product?.stock <= 3;

    useEffect(() => {
    if (!slug) return;
    
    // WebSocket connection for real-time comment updates
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/ws/product/${product?.id || 0}/`;
    let socket;

    if (product?.id) {
      socket = new WebSocket(wsUrl);
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'comment_update') {
          mutate(); // Re-fetch product data to show new approved comments
        }
      };
    }

    return () => {
      if (socket) socket.close();
    };
  }, [product?.id, slug, mutate]);

  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-foreground-muted text-sm font-medium">در حال بارگذاری محصول...</span>
        </div>
    </div>
  );

  if (error || !product) return (
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
            <Link href={`/category/${product.category_slug}`} className="hover:text-primary transition-colors">{product.category?.name}</Link>
          <span className="text-foreground-muted">/</span>
          <span className="text-foreground font-medium">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 text-right" dir="rtl">
          
          {/* --- ستون راست: گالری تصویر --- */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
                <div className="relative aspect-square rounded-3xl overflow-hidden bg-secondary border border-border shadow-sm group">
                    {product.main_image ? (
                        <img 
                            src={getImageUrl(product.main_image)} 
                            alt={product.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => {
                                console.log('Image load error:', e.target.src);
                                e.target.src = '/placeholder-product.jpg';
                                e.target.onerror = null;
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary">
                            <span className="text-foreground-muted text-lg">بدون تصویر</span>
                        </div>
                    )}
                    
                    {/* نشان‌های روی عکس */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                        {(() => {
                            const finalPrice = product.discount_price !== null && product.discount_price !== undefined 
                                ? product.discount_price 
                                : product.price;
                            const isFree = Number(finalPrice) === 0;
                            
                            if (isFree) {
                                return (
                                    <span className="bg-success text-white text-sm font-bold px-3 py-1.5 rounded-xl shadow-lg shadow-success/20">
                                        رایگان
                                    </span>
                                );
                            } else if (product.discount_price && product.discount_price < product.price) {
                                return (
                                    <span className="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl shadow-lg shadow-red-500/20">
                                        {calculateDiscount(product.price, product.discount_price)}% تخفیف
                                    </span>
                                );
                            }
                            return null;
                        })()}
                    </div>
                </div>
                
                {/* دکمه‌های اشتراک و علاقه */}
                <div className="flex items-center gap-4 justify-center">
                    <FavoriteToggle 
                      productId={product.id} 
                      isFavoriteInitial={product.is_favorite} 
                      className="flex items-center gap-2 text-foreground-muted hover:text-error transition-colors text-sm font-medium"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success("لینک محصول کپی شد");
                      }}
                      className="flex items-center gap-2 text-foreground-muted hover:text-primary transition-colors text-sm font-medium"
                    >
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
                        {product.category?.name}
                    </span>
                    <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-foreground-muted text-sm font-medium pt-0.5">(۵.۰)</span>
                    </div>
                </div>
                <h1 className="text-3xl lg:text-4xl font-black text-foreground leading-tight mb-4">
                    {product.title}
                </h1>
                
                {/* Stock Status */}
                <div className="flex items-center gap-2 mb-6">
                    {isOutOfStock ? (
                        <span className="bg-destructive/10 text-destructive px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            اتمام موجودی
                        </span>
                    ) : isLowStock ? (
                        <span className="bg-orange-500/10 text-orange-600 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 animate-pulse">
                            <Zap className="w-3 h-3 fill-current" />
                            تنها {product.stock} ظرفیت باقی‌مانده!
                        </span>
                    ) : (
                        <span className="bg-success/10 text-success px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {product.stock} عدد آماده تحویل آنی
                        </span>
                    )}
                </div>

                {/* File Information - Only show for file products */}
                {product.product_type === 'file' && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 mb-6">
                        <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2 text-sm flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            فایل قابل دانلود
                        </h3>
                        <div className="space-y-2 text-sm">
                            {product.file_type && (
                                <div className="flex items-center justify-between">
                                    <span className="text-blue-700 dark:text-blue-300">نوع فایل:</span>
                                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md font-medium uppercase">
                                        {product.file_type}
                                    </span>
                                </div>
                            )}
                            {product.file_size && (
                                <div className="flex items-center justify-between">
                                    <span className="text-blue-700 dark:text-blue-300">حجم فایل:</span>
                                    <span className="text-blue-800 dark:text-blue-200 font-medium">
                                        {product.file_size}
                                    </span>
                                </div>
                            )}
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                💡 پس از خرید و تایید سفارش، فایل برای دانلود در دسترس خواهد بود
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* توضیحات محصول */}
            <div className="bg-secondary/50 rounded-2xl p-4 md:p-6">
                 <h3 className="font-bold text-foreground mb-3 flex items-center gap-2 justify-start">
                    <Clock className="w-5 h-5 text-primary" />
                    توضیحات
                </h3>
                <div className="text-foreground-muted text-sm leading-8 whitespace-pre-line text-right">
                    {product.description || 'توضیحات محصول موجود نیست.'}
                </div>
            </div>

            {/* ویژگی‌های کلیدی */}
            <div className="border-t border-b border-border py-6 space-y-3">
                <h3 className="font-bold text-foreground mb-2 text-sm text-right">ویژگی‌های برجسته:</h3>
                <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-foreground-muted justify-start">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span>تحویل {product.delivery_time || 'آنی'} و اتوماتیک پس از پرداخت</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-foreground-muted justify-start">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span>قابلیت تمدید قانونی روی ایمیل شخصی</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-foreground-muted justify-start">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span>گارانتی کامل تا آخرین روز اشتراک</span>
                    </li>
                </ul>
            </div>

            {/* بخش نظرات */}
            <CommentsSection 
              productId={product.id} 
              comments={product.comments} 
              onCommentSubmit={() => mutate()} 
            />
          </div>

          {/* --- ستون چپ: باکس خرید (Sticky Buy Box) --- */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-none sticky top-24">
                
                {/* قیمت */}
                <div className="mb-6">
                    {(() => {
                        const finalPrice = product.discount_price !== null && product.discount_price !== undefined 
                            ? product.discount_price 
                            : product.price;
                        const isFree = finalPrice === 0 || finalPrice === '0' || Number(finalPrice) === 0;
                        
                        return (
                            <>
                                <div className="flex items-center justify-between mb-1 text-foreground-muted text-sm">
                                    <span>قیمت اصلی:</span>
                                    {product.discount_price !== null && product.discount_price !== undefined && product.price > 0 && (
                                        <span className="line-through decoration-red-400 decoration-2">
                                            {formatPrice(product.price)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                    {isFree ? (
                                        <span className="text-4xl font-black text-success">
                                            رایگان
                                        </span>
                                    ) : (
                                        <>
                                            <span className="text-4xl font-black text-foreground">
                                                {formatPrice(finalPrice)}
                                            </span>
                                            <span className="text-sm font-medium text-foreground-muted mt-2">تومان</span>
                                        </>
                                    )}
                                </div>
                            </>
                        );
                    })()}
                </div>

                  {/* دکمه خرید */}
                  <button 
                      onClick={() => {
                          if (isOutOfStock) {
                              toast.error("این محصول در حال حاضر موجود نیست");
                              return;
                          }
                          addToCart(product);
                          toast.success("محصول به سبد خرید اضافه شد");
                      }}
                      disabled={isOutOfStock}
                      className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 mb-4 ${
                          isOutOfStock 
                          ? "bg-muted text-muted-foreground cursor-not-allowed grayscale" 
                          : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]"
                      }`}
                  >
                      {isOutOfStock ? (
                          <>
                              <AlertCircle className="w-6 h-6" />
                              اتمام موجودی
                          </>
                      ) : (
                          <>
                              <ShoppingCart className="w-6 h-6" />
                              افزودن به سبد خرید
                          </>
                      )}
                  </button>

                  {/* Download Button for purchased file products */}
                  {product.product_type === 'file' && product.can_download && (
                      <button 
                          onClick={async () => {
                              try {
                                  const response = await api.get(`/products/${product.slug}/download/`, {
                                      responseType: 'blob'
                                  });
                                  
                                  // Create download link
                                  const url = window.URL.createObjectURL(new Blob([response.data]));
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.setAttribute('download', `${product.title}.${product.file_type || 'file'}`);
                                  document.body.appendChild(link);
                                  link.click();
                                  link.remove();
                                  window.URL.revokeObjectURL(url);
                                  
                                  toast.success("دانلود شروع شد");
                              } catch (error) {
                                  toast.error("خطا در دانلود فایل");
                              }
                          }}
                          className="w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 mb-4 bg-green-600 hover:bg-green-700 text-white shadow-green-600/25 hover:scale-[1.02] active:scale-[0.98]"
                      >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          دانلود فایل
                      </button>
                  )}

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
