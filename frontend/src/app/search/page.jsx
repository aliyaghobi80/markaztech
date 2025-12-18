"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useProductWebSocket } from "@/lib/useProductWebSocket";
import ProductCard from "@/components/ProductCard";
import { Search, SlidersHorizontal, ArrowDownWideNarrow, ArrowUpNarrowWide, Clock, Grid3X3, LayoutGrid, X, Filter, Package, Sparkles } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  const handleWebSocketMessage = useCallback((data) => {
    if (data.type === 'product_update') {
      setProducts(prev => {
        if (data.action === 'created') {
          if (data.product.is_active) {
            return [data.product, ...prev];
          }
          return prev;
        } else if (data.action === 'updated') {
          const existingIndex = prev.findIndex(p => p.id === data.product.id);
          
          if (existingIndex !== -1) {
            if (!data.product.is_active) {
              return prev.filter(p => p.id !== data.product.id);
            }
            return prev.map(p => p.id === data.product.id ? { ...p, ...data.product } : p);
          } else {
            if (data.product.is_active) {
              return [data.product, ...prev];
            }
          }
        }
        return prev;
      });
    } else if (data.type === 'product_delete') {
      setProducts(prev => prev.filter(p => p.id !== data.product_id));
    }
  }, []);

  useProductWebSocket(handleWebSocketMessage);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/products/categories/");
        setCategories(response.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        let url = `/products/`;
        const params = new URLSearchParams();
        
        if (query.trim()) {
          params.append('search', query);
        }
        if (selectedCategory) {
          params.append('category', selectedCategory);
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const response = await api.get(url);
        let fetchedProducts = [];
        if (response.data) {
          if (Array.isArray(response.data)) {
            fetchedProducts = response.data;
          } else if (response.data.results && Array.isArray(response.data.results)) {
            fetchedProducts = response.data.results;
          } else if (response.data.value && Array.isArray(response.data.value)) {
            fetchedProducts = response.data.value;
          } else if (typeof response.data === 'object' && response.data.id) {
            fetchedProducts = [response.data];
          }
        }
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, selectedCategory]);

  const filteredProducts = products.filter(product => {
    const price = product.discount_price || product.price;
    const minOk = !priceRange.min || price >= Number(priceRange.min);
    const maxOk = !priceRange.max || price <= Number(priceRange.max);
    return minOk && maxOk;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
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

  const handleCategoryChange = (slug) => {
    setSelectedCategory(slug);
    const params = new URLSearchParams(searchParams);
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    router.push('/search');
  };

  const hasActiveFilters = selectedCategory || priceRange.min || priceRange.max || query;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/30 border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 py-12 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              {query ? "نتایج جستجو" : "فروشگاه محصولات"}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4">
              {query ? (
                <>
                  جستجو برای <span className="text-primary">"{query}"</span>
                </>
              ) : (
                "همه محصولات"
              )}
            </h1>
            
            <p className="text-foreground-muted text-lg">
              {loading ? "در حال بارگذاری..." : `${sortedProducts.length} محصول پیدا شد`}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  فیلترها
                </h3>
                {hasActiveFilters && (
                  <button 
                    onClick={clearFilters}
                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    پاک کردن
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">دسته‌بندی</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    <button
                      onClick={() => handleCategoryChange('')}
                      className={`w-full text-right px-4 py-2.5 rounded-xl text-sm transition-all ${
                        !selectedCategory 
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                          : 'bg-secondary/50 text-foreground-muted hover:bg-secondary'
                      }`}
                    >
                      همه دسته‌ها
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.slug)}
                        className={`w-full text-right px-4 py-2.5 rounded-xl text-sm transition-all ${
                          selectedCategory === cat.slug 
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                            : 'bg-secondary/50 text-foreground-muted hover:bg-secondary'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <label className="block text-sm font-medium text-foreground mb-3">محدوده قیمت (تومان)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        placeholder="از"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        className="w-full bg-secondary/50 border border-border rounded-xl py-2.5 px-3 text-sm text-foreground placeholder:text-foreground-muted/50 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="تا"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        className="w-full bg-secondary/50 border border-border rounded-xl py-2.5 px-3 text-sm text-foreground placeholder:text-foreground-muted/50 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <div className="bg-card border border-border rounded-2xl p-4 mb-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl text-sm font-medium text-foreground"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    فیلترها
                  </button>

                  <div className="hidden sm:flex items-center gap-1 bg-secondary rounded-xl p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-card shadow-sm text-primary' : 'text-foreground-muted hover:text-foreground'}`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("large")}
                      className={`p-2 rounded-lg transition-all ${viewMode === 'large' ? 'bg-card shadow-sm text-primary' : 'text-foreground-muted hover:text-foreground'}`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-sm text-foreground-muted whitespace-nowrap">مرتب‌سازی:</span>
                  {[
                    { key: "newest", label: "جدیدترین", icon: Clock },
                    { key: "price-low", label: "ارزان‌ترین", icon: ArrowDownWideNarrow },
                    { key: "price-high", label: "گران‌ترین", icon: ArrowUpNarrowWide },
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setSortOrder(key)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                        sortOrder === key
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                          : 'bg-secondary/50 text-foreground-muted hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {loading ? (
              <div className={`grid gap-6 ${viewMode === 'large' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2' : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="bg-card rounded-2xl h-72 animate-pulse border border-border">
                    <div className="h-40 bg-secondary/50 rounded-t-2xl"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-secondary/50 rounded-lg w-3/4"></div>
                      <div className="h-3 bg-secondary/50 rounded-lg w-1/2"></div>
                      <div className="h-6 bg-secondary/50 rounded-lg w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className={`grid gap-6 ${viewMode === 'large' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2' : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                {sortedProducts.map((product, index) => (
                  <div 
                    key={product.id} 
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-secondary to-secondary/50 mb-6">
                  <Package className="w-10 h-10 text-foreground-muted" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">محصولی یافت نشد!</h3>
                <p className="text-foreground-muted max-w-md mx-auto mb-6">
                  {query 
                    ? `برای "${query}" محصولی پیدا نکردیم. کلمات دیگری امتحان کنید یا فیلترها را تغییر دهید.`
                    : "در حال حاضر هیچ محصولی با این فیلترها موجود نیست."
                  }
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  >
                    <X className="w-4 h-4" />
                    پاک کردن فیلترها
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-foreground-muted">در حال بارگذاری...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
