// مسیر: src/app/page.js
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products/");
        // هندل کردن حالت صفحه‌بندی (اگر بک‌اند results برگرداند)
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
        console.error("خطا در دریافت محصولات:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-background pb-20">

      {/* 1. بنر اصلی */}
      <HeroSection />

      {/* 2. لیست محصولات */}
      <div className="container mx-auto px-4">

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
            <span className="w-3 h-8 bg-primary rounded-sm"></span>
            جدیدترین محصولات
          </h2>
        </div>

        {loading ? (
          // حالت لودینگ (اسکلت)
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="card-base rounded-2xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-foreground-muted">
                هنوز محصولی اضافه نشده است :(
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}