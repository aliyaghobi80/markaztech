// مسیر: src/context/LoadingContext.jsx
"use client";

import { createContext, useContext, useState } from "react";

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);

  const showLoading = () => setIsLoading(true);
  const hideLoading = () => setIsLoading(false);

  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading }}>
      {children}
      
      {/* Global Loading Overlay */}
      {isLoading && (
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
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return context;
}