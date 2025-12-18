// مسیر: src/app/search/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import ProductCard from "@/components/ProductCard";
import { Search, SlidersHorizontal, ArrowDownWideNarrow, ArrowUpNarrowWide, Clock } from "lucide-react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get(`/products/?search=${encodeURIComponent(query)}`);
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
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("خطا در جستجو:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  // منطق مرتب‌سازی
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortOrder) {
      case "price-low":
        return (a.discount_price || a.price) - (b.discount_price || b.price);
      case "price-high":
        return (b.discount_price || b.price) - (a.discount_price || a.price);
      case "oldest":
        return new Date(a.created_at) - new Date(b.created_at);
      case "newest":
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  return (
    <div className="min-h-screen bg-background py-8 transition-colors duration-300">
      <div className="container mx-auto px-4">
        
        {/* هدر نتایج جستجو */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground mb-1 flex items-center gap-3">
                <Search className="w-7 h-7 text-primary" />
                نتایج جستجو
                {query && <span className="text-primary">"{query}"</span>}
              </h1>
              <p className="text-foreground-muted text-sm">
                {loading ? "در حال جستجو..." : `${products.length} محصول پیدا شد`}
              </p>
            </div>

            {/* دکمه‌های مرتب‌سازی */}
            {!loading && products.length > 0 && (
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
            )}
          </div>
        </div>

        {/* نتایج */}
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
            ) : query ? (
              <div className="col-span-full py-20 text-center">
                <div className="inline-block p-6 rounded-full bg-secondary mb-4">
                  <Search className="w-12 h-12 text-foreground-muted" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">نتیجه‌ای یافت نشد!</h3>
                <p className="text-foreground-muted">
                  برای "{query}" محصولی پیدا نکردیم. کلمات دیگری امتحان کنید.
                </p>
              </div>
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="inline-block p-6 rounded-full bg-secondary mb-4">
                  <Search className="w-12 h-12 text-foreground-muted" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">جستجو کنید</h3>
                <p className="text-foreground-muted">
                  کلمه کلیدی خود را در بالا وارد کنید.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}