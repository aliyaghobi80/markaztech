// مسیر: src/app/category/[slug]/page.jsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { useProductWebSocket } from "@/lib/useProductWebSocket";
import ProductCard from "@/components/ProductCard";
import { useLoading } from "@/context/LoadingContext";
import { SlidersHorizontal, ArrowDownWideNarrow, ArrowUpNarrowWide, Clock } from "lucide-react";

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("newest");
  const [error, setError] = useState(null);
  const { showLoading, hideLoading } = useLoading();
  
  const categorySlug = slug ? decodeURIComponent(slug) : "";

  const handleWebSocketMessage = useCallback((data) => {
    if (data.type === 'product_update') {
      setProducts(prev => {
        if (data.action === 'created') {
          // فقط محصولات فعال و مربوط به این دسته را اضافه کن
          if (data.product.is_active && data.product.category?.slug === categorySlug) {
            return [data.product, ...prev];
          }
          return prev;
        } else if (data.action === 'updated') {
          return prev.map(p => {
            if (p.id === data.product.id) {
              // اگر محصول غیرفعال شده یا دسته‌اش تغییر کرده، آن را حذف کن
              if (!data.product.is_active || data.product.category?.slug !== categorySlug) {
                return null;
              }
              // بروزرسانی محصول با داده‌های جدید
              return { ...p, ...data.product };
            }
            return p;
          }).filter(Boolean); // حذف null values
        }
        return prev;
      });
    } else if (data.type === 'product_delete') {
      setProducts(prev => prev.filter(p => p.id !== data.product_id));
    }
  }, [categorySlug]);

  useProductWebSocket(handleWebSocketMessage);

  useEffect(() => {
    setProducts([]);
    setLoading(true);
    setError(null);
  }, [slug]);

useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setProducts([]); // Clear previous products first
      showLoading(); // Global loading
      
      try {
        console.log("Fetching products for category:", categorySlug); // دیباگ
        const apiUrl = `/products/?category=${encodeURIComponent(categorySlug)}&_t=${Date.now()}`;
        console.log("API URL:", apiUrl); // دیباگ
        const response = await api.get(apiUrl);
        console.log("API Response:", response.data); // دیباگ
        
        // Handle different response structures
        let fetchedProducts = [];
        if (response.data) {
          if (Array.isArray(response.data)) {
            fetchedProducts = response.data;
          } else if (response.data.results && Array.isArray(response.data.results)) {
            fetchedProducts = response.data.results;
          } else if (response.data.value && Array.isArray(response.data.value)) {
            fetchedProducts = response.data.value;
          } else if (typeof response.data === 'object' && response.data.id) {
            // Single object response
            fetchedProducts = [response.data];
          }
        }
        
        console.log("Fetched products:", fetchedProducts); // دیباگ
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching category products:", error);
        setError(error.message);
        setProducts([]); // تنظیم آرایه خالی در صورت خطا
      } finally {
        setLoading(false);
        hideLoading(); // Hide global loading
      }
    };

    if (categorySlug) {
      fetchProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [categorySlug]);
  
  // منطق مرتب‌سازی (Client-Side Sorting)
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortOrder) {
      case "price-low": // ارزان‌ترین
        return (a.discount_price || a.price) - (b.discount_price || b.price);
      case "price-high": // گران‌ترین
        return (b.discount_price || b.price) - (a.discount_price || a.price);
      case "oldest": // قدیمی‌ترین
        return new Date(a.created_at) - new Date(b.created_at);
      case "newest": // جدیدترین (پیش‌فرض)
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  return (
    <div className="min-h-screen bg-background py-8 transition-colors duration-300">
      <div className="container mx-auto px-4">
        
        {/* هدر دسته‌بندی و فیلترها */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-foreground mb-1">
                محصولات دسته: <span className="text-primary">{slug}</span>
            </h1>
            <p className="text-foreground-muted text-sm">{products.length} محصول پیدا شد</p>
          </div>

          {/* دکمه‌های مرتب‌سازی */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <span className="text-sm font-bold text-foreground ml-2 flex items-center gap-1">
                <SlidersHorizontal className="w-4 h-4" />
                مرتب‌سازی:
            </span>
            
            <button 
                onClick={() => setSortOrder("newest")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${sortOrder === 'newest' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-secondary text-foreground-muted hover:bg-secondary/80'}`}
            >
                <Clock className="w-4 h-4" />
                جدیدترین
            </button>

            <button 
                onClick={() => setSortOrder("price-low")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${sortOrder === 'price-low' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-secondary text-foreground-muted hover:bg-secondary/80'}`}
            >
                <ArrowDownWideNarrow className="w-4 h-4" />
                ارزان‌ترین
            </button>

            <button 
                onClick={() => setSortOrder("price-high")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${sortOrder === 'price-high' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-secondary text-foreground-muted hover:bg-secondary/80'}`}
            >
                <ArrowUpNarrowWide className="w-4 h-4" />
                گران‌ترین
            </button>
          </div>
        </div>

        {/* لیست محصولات */}
        {loading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {[1, 2, 3, 4].map((n) => (
               <div key={n} className="bg-card rounded-2xl h-80 animate-pulse border border-border"></div>
             ))}
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedProducts.length > 0 ? (
              sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="inline-block p-6 rounded-full bg-secondary mb-4">
                    <SlidersHorizontal className="w-12 h-12 text-foreground-muted" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">محصولی یافت نشد!</h3>
                <p className="text-foreground-muted">در این دسته‌بندی هنوز محصولی اضافه نشده است.</p>
              </div>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
}