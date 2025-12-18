// مسیر: src/components/GlobalLoading.jsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function GlobalLoading() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // شروع لودینگ
    setLoading(true);
    
    // تایمر برای پایان لودینگ (شبیه‌سازی لود شدن صفحه)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">
      <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
        {/* اسپینر لودینگ */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-secondary rounded-full animate-spin border-t-primary"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent rounded-full animate-ping border-t-primary/20"></div>
        </div>
        
        {/* متن لودینگ */}
        <div className="text-center">
          <h3 className="font-bold text-foreground mb-1">در حال بارگذاری...</h3>
          <p className="text-sm text-foreground-muted">لطفاً صبر کنید</p>
        </div>
      </div>
    </div>
  );
}