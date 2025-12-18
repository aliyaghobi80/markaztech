"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { useProductWebSocket } from "@/lib/useProductWebSocket";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import { Sparkles, Shield, Zap, Clock, HeadphonesIcon, CreditCard } from "lucide-react";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleWebSocketMessage = useCallback((data) => {
    if (data.type === 'product_update') {
      setProducts(prev => {
        if (data.action === 'created') {
          // فقط محصولات فعال را اضافه کن
          if (data.product.is_active) {
            return [data.product, ...prev];
          }
          return prev;
        } else if (data.action === 'updated') {
          return prev.map(p => {
            if (p.id === data.product.id) {
              // اگر محصول غیرفعال شده، آن را حذف کن
              if (!data.product.is_active) {
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
  }, []);

  useProductWebSocket(handleWebSocketMessage);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products/");
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
        console.error("خطا در دریافت محصولات:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "ضمانت اصالت",
      description: "تمامی اکانت‌ها اصل و با ضمانت هستند",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "تحویل آنی",
      description: "اطلاعات اکانت بلافاصله ارسال می‌شود",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <HeadphonesIcon className="w-6 h-6" />,
      title: "پشتیبانی ۲۴/۷",
      description: "تیم پشتیبانی همیشه در دسترس شماست",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "پرداخت امن",
      description: "پرداخت مستقیم و بدون واسطه",
      color: "from-blue-500 to-cyan-500"
    }
  ];

  return (
    <div className="bg-background">
      <HeroSection />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-foreground-muted text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-background-secondary">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-primary to-blue-400 rounded-full"></div>
              <div>
                <h2 className="text-2xl font-black text-foreground">جدیدترین محصولات</h2>
                <p className="text-foreground-muted text-sm">بهترین اکانت‌های پریمیوم با قیمت رقابتی</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-card border border-border rounded-2xl h-80 animate-pulse"></div>
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
                  هنوز محصولی اضافه نشده است
                </div>
              )}
            </div>
          )}
        </div>
      </section>

        <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-primary/10 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6bTAgMTV2Nmg2di02aC02em0wIDE1djZoNnYtNmgtNnptMTUgMHY2aDZ2LTZoLTZ6bTAtMTV2Nmg2di02aC02em0wLTE1djZoNnYtNmgtNnptLTMwIDMwdjZoNnYtNmgtNnptMC0xNXY2aDZ2LTZoLTZ6bTAtMTV2Nmg2di02aC02em0xNSAzMHY2aDZ2LTZoLTZ6bTAtMTV2Nmg2di02aC02em0wLTE1djZoNnYtNmgtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6bTAgMTV2Nmg2di02aC02em0wIDE1djZoNnYtNmgtNnptMTUgMHY2aDZ2LTZoLTZ6bTAtMTV2Nmg2di02aC02em0wLTE1djZoNnYtNmgtNnptLTMwIDMwdjZoNnYtNmgtNnptMC0xNXY2aDZ2LTZoLTZ6bTAtMTV2Nmg2di02aC02em0xNSAzMHY2aDZ2LTZoLTZ6bTAtMTV2Nmg2di02aC02em0wLTE1djZoNnYtNmgtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">مرکز تخصصی اکانت‌های پریمیوم</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black text-foreground mb-6">
                همین الان شروع کنید!
              </h2>
              <p className="text-foreground-muted text-lg mb-8 leading-relaxed">
                با ثبت‌نام در مرکزتک، به صدها اکانت پریمیوم با قیمت‌های استثنایی دسترسی پیدا کنید
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a 
                  href="/register" 
                  className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/25"
                >
                  ثبت‌نام رایگان
                </a>
                <a 
                  href="/search" 
                  className="px-8 py-4 bg-secondary backdrop-blur border border-border text-foreground font-bold rounded-2xl hover:bg-secondary/80 transition-all"
                >
                  مشاهده محصولات
                </a>
              </div>
            </div>
          </div>
        </section>
    </div>
  );
}
