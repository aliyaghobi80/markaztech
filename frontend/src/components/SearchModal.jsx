// مسیر: src/components/SearchModal.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Clock, TrendingUp, ArrowRight } from "lucide-react";
import api from "@/lib/axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches] = useState([
    "ChatGPT", "هوش مصنوعی", "اکانت پریمیم", "موزیک", "AI"
  ]);
  
  const inputRef = useRef(null);
  const searchTimeout = useRef(null);
  const router = useRouter();

  // فوکوس روی اینپوت وقتی مودال باز می‌شود
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // بارگذاری جستجوهای اخیر از localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // جستجوی تاخیری (Debounced Search)
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    // پاک کردن تایمر قبلی
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // تنظیم تایمر جدید
    searchTimeout.current = setTimeout(async () => {
      setLoading(true);
      setResults([]); // Clear previous results first
      
      try {
        const searchUrl = `/products/?search=${encodeURIComponent(query)}&_t=${Date.now()}`;
        console.log("Search URL:", searchUrl); // دیباگ
        const response = await api.get(searchUrl);
        console.log("Search Response:", response.data); // دیباگ
        
        // Handle different response structures
        let searchResults = [];
        if (response.data) {
          if (Array.isArray(response.data)) {
            searchResults = response.data;
          } else if (response.data.results && Array.isArray(response.data.results)) {
            searchResults = response.data.results;
          } else if (response.data.value && Array.isArray(response.data.value)) {
            searchResults = response.data.value;
          } else if (typeof response.data === 'object' && response.data.id) {
            // Single object response
            searchResults = [response.data];
          }
        }
        
        console.log("Search Results:", searchResults); // دیباگ
        setResults(searchResults);
      } catch (error) {
        console.error("خطا در جستجو:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms تاخیر

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query]);

  // ذخیره جستجو در تاریخچه
  const saveSearch = (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // هندل کلیک روی نتیجه
  const handleResultClick = (product) => {
    saveSearch(query);
    onClose();
  };

  // هندل کلیک روی جستجوی محبوب/اخیر
  const handleQuickSearch = (searchTerm) => {
    setQuery(searchTerm);
  };

  // هندل Enter برای رفتن به صفحه جستجو
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      saveSearch(query);
      router.push(`/search?q=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  // رفتن به صفحه جستجوی کامل
  const goToFullSearch = () => {
    if (query.trim()) {
      saveSearch(query);
      router.push(`/search?q=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  // بستن مودال با ESC و باز کردن با Ctrl+K
  useEffect(() => {
    const handleKeyboard = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
      // Ctrl+K یا Cmd+K برای باز کردن جستجو
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && !isOpen) {
        e.preventDefault();
        // این را در Header اضافه خواهیم کرد
      }
    };
    
    document.addEventListener("keydown", handleKeyboard);
    
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    return () => {
      document.removeEventListener("keydown", handleKeyboard);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        
          {/* هدر جستجو */}
          <div className="flex items-center gap-4 p-6 border-b border-border">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-3.5 text-foreground-muted w-5 h-5" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="جستجو در بین محصولات..."
                className="w-full bg-secondary border border-border text-foreground rounded-xl py-3 pr-12 pl-12 outline-none focus:ring-2 focus:ring-primary transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute left-4 top-3 p-0.5 hover:bg-secondary rounded-full transition-colors"
                  title="پاک کردن جستجو"
                >
                  <X className="w-4 h-4 text-foreground-muted hover:text-foreground" />
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-foreground-muted" />
            </button>
          </div>

        {/* محتوای جستجو */}
        <div className="max-h-96 overflow-y-auto">
          
          {/* حالت بدون جستجو */}
          {!query.trim() && (
            <div className="p-6 space-y-6">
              
              {/* جستجوهای اخیر */}
              {recentSearches.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-foreground-muted mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    جستجوهای اخیر
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickSearch(search)}
                        className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground-secondary text-sm rounded-lg transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* جستجوهای محبوب */}
              <div>
                <h3 className="text-sm font-bold text-foreground-muted mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  جستجوهای محبوب
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickSearch(search)}
                      className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-sm rounded-lg transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* حالت لودینگ */}
          {loading && (
            <div className="p-6 text-center">
              <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-foreground-muted text-sm mt-2">در حال جستجو...</p>
            </div>
          )}

          {/* نتایج جستجو */}
          {query.trim() && !loading && (
            <div className="p-4">
              {results.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2 mb-3">
                    <p className="text-sm text-foreground-muted">
                      {results.length} نتیجه برای "{query}"
                    </p>
                    <button
                      onClick={goToFullSearch}
                      className="text-sm text-primary hover:text-primary-hover font-medium flex items-center gap-1"
                    >
                      مشاهده همه
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  {results.slice(0, 5).map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={() => handleResultClick(product)}
                      className="flex items-center gap-4 p-3 hover:bg-secondary rounded-xl transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                        <img 
                          src={product.main_image} 
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {product.title}
                        </h4>
                        <p className="text-sm text-foreground-muted truncate">
                          {product.category}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-primary">
                          {formatPrice(product.discount_price || product.price)}
                        </p>
                        {product.discount_price && (
                          <p className="text-xs text-foreground-muted line-through">
                            {formatPrice(product.price)}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-foreground-muted" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">نتیجه‌ای یافت نشد</h3>
                  <p className="text-foreground-muted text-sm">
                    برای "{query}" محصولی پیدا نکردیم. کلمات دیگری امتحان کنید.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}