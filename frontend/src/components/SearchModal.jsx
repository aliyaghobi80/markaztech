"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Clock, TrendingUp, ArrowLeft, Sparkles, Package, Zap } from "lucide-react";
import api from "@/lib/axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [popularSearches] = useState([
    "ChatGPT", "هوش مصنوعی", "اکانت پریمیم", "Spotify", "Netflix"
  ]);
  
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const router = useRouter();
  const resultsRef = useRef(null);

  // WebSocket connection management
  useEffect(() => {
    if (isOpen) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname;
      const port = '8001'; // Django port
      const wsUrl = `${protocol}//${host}:${port}/ws/search/`;
      
      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'search_results') {
          // Verify if result is for the current query
          setResults(data.results);
          setLoading(false);
          setSelectedIndex(-1);
        }
      };

      socketRef.current.onclose = () => {
        console.log('Search WebSocket closed');
      };

      return () => {
        socketRef.current?.close();
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Send search query via WebSocket
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setSelectedIndex(-1);
      setLoading(false);
      return;
    }

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      setLoading(true);
      socketRef.current.send(JSON.stringify({ query }));
    } else {
      // Fallback to API if socket is not ready
      const fetchResults = async () => {
        setLoading(true);
        try {
          const response = await api.get(`/products/?search=${encodeURIComponent(query)}`);
          setResults(response.data.results || response.data || []);
        } catch (error) {
          console.error("Search API Error:", error);
        } finally {
          setLoading(false);
        }
      };
      
      const timeout = setTimeout(fetchResults, 300);
      return () => clearTimeout(timeout);
    }
  }, [query]);

  const saveSearch = useCallback((searchTerm) => {
    if (!searchTerm.trim()) return;
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  }, [recentSearches]);

  const handleResultClick = (product) => {
    saveSearch(query);
    onClose();
  };

  const handleQuickSearch = (searchTerm) => {
    setQuery(searchTerm);
    inputRef.current?.focus();
  };

  const navigateToSearch = useCallback(() => {
    if (query.trim()) {
      saveSearch(query);
      router.push(`/products?q=${encodeURIComponent(query)}`);
      onClose();
    } else {
      router.push('/products');
      onClose();
    }
  }, [query, saveSearch, router, onClose]);

  const handleKeyDown = (e) => {
    const items = results.slice(0, 5);
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => prev < items.length - 1 ? prev + 1 : prev);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && items[selectedIndex]) {
        saveSearch(query);
        router.push(`/product/${items[selectedIndex].slug}`);
        onClose();
      } else {
        navigateToSearch();
      }
    }
  };

  useEffect(() => {
    const handleKeyboard = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
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
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-start justify-center pt-[10vh] animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden animate-in slide-in-from-top-4 zoom-in-95 duration-300">
        <div className="relative p-5 border-b border-border bg-gradient-to-b from-secondary/30 to-transparent">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted w-5 h-5" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="جستجو به صورت لحظه‌ای..."
              className="w-full bg-background border border-border text-foreground rounded-2xl py-4 pr-12 pl-24 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base"
              autoComplete="off"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-primary/10 text-primary text-[10px] px-2 py-1 rounded-lg font-black animate-pulse">
                <Zap className="w-3 h-3 fill-primary" />
                Real-time
              </div>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary border border-border rounded-lg text-foreground-muted">
                ESC
              </kbd>
            </div>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto" ref={resultsRef}>
          {!query.trim() && (
            <div className="p-5 space-y-6">
              <button
                onClick={() => { router.push('/products'); onClose(); }}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl hover:from-primary/20 hover:to-primary/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">مشاهده همه محصولات</p>
                    <p className="text-xs text-foreground-muted">تمامی محصولات فروشگاه</p>
                  </div>
                </div>
                <ArrowLeft className="w-5 h-5 text-primary group-hover:-translate-x-1 transition-transform" />
              </button>

              {recentSearches.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-foreground-muted" />
                    جستجوهای اخیر
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickSearch(search)}
                        className="px-4 py-2 bg-secondary/70 hover:bg-secondary border border-border text-foreground text-sm rounded-xl transition-all hover:border-primary/30"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  پرجستجوترین‌ها
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickSearch(search)}
                      className="px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-sm rounded-xl transition-all font-medium"
                    >
                      <Sparkles className="w-3 h-3 inline-block ml-1" />
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-foreground-muted text-sm">در حال جستجو...</p>
            </div>
          )}

          {query.trim() && !loading && (
            <div className="p-4">
              {results.length > 0 ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-2 mb-3">
                    <p className="text-sm text-foreground-muted">
                      <span className="font-bold text-foreground">{results.length}</span> نتیجه برای "{query}"
                    </p>
                    <button
                      onClick={navigateToSearch}
                      className="text-sm text-primary hover:text-primary/80 font-bold flex items-center gap-1 group"
                    >
                      مشاهده همه
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </button>
                  </div>
                  
                  {results.slice(0, 5).map((product, index) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={() => handleResultClick(product)}
                      className={`flex items-center gap-4 p-3 rounded-2xl transition-all group ${
                        selectedIndex === index 
                          ? 'bg-primary/10 border border-primary/30' 
                          : 'hover:bg-secondary/70 border border-transparent'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-secondary flex-shrink-0 border border-border">
                        <img 
                          src={product.main_image.startsWith('http') ? product.main_image : `http://localhost:8001${product.main_image}`} 
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {product.title}
                        </h4>
                          <p className="text-xs text-foreground-muted truncate mt-0.5">
                            {product.category_name || (product.category?.name)}
                          </p>
                      </div>
                      <div className="text-left flex-shrink-0">
                        <p className="font-black text-primary text-lg">
                          {formatPrice(product.discount_price !== null ? product.discount_price : product.price)}
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
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-secondary to-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-foreground-muted" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2 text-lg">نتیجه‌ای یافت نشد</h3>
                  <p className="text-foreground-muted text-sm mb-4">
                    برای "{query}" محصولی پیدا نکردیم
                  </p>
                  <button
                    onClick={() => { router.push('/products'); onClose(); }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all text-sm"
                  >
                    مشاهده همه محصولات
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-border bg-secondary/30 flex items-center justify-between text-xs text-foreground-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">↓</kbd>
              برای انتخاب
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">Enter</kbd>
              برای رفتن
            </span>
          </div>
          <span className="hidden sm:block">Ctrl+K برای جستجو</span>
        </div>
      </div>
    </div>
  );
}
