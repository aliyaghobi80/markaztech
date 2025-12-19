// مسیر: src/app/admin/layout.jsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, Users, ShoppingBag, MessageSquare, 
  Ticket, CreditCard, LogOut, Package, BookOpen, Menu, X, Tag
} from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // محافظت از روت (فقط ادمین راه دارد)
  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'ADMIN') {
        router.push("/dashboard"); 
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'ADMIN') return null;

    const menuItems = [
      { name: "پیشخوان", icon: LayoutDashboard, href: "/admin" },
      { name: "مدیریت دسته‌بندی‌ها", icon: Tag, href: "/admin/categories" },
      { name: "مدیریت محصولات", icon: Package, href: "/admin/products" },
      { name: "مدیریت مقالات", icon: BookOpen, href: "/admin/articles" },
      { name: "مدیریت کاربران", icon: Users, href: "/admin/users" },
      { name: "سفارشات و پرداخت", icon: CreditCard, href: "/admin/orders" },
      { name: "نظرات", icon: MessageSquare, href: "/admin/comments" },
      { name: "تیکت‌ها", icon: Ticket, href: "/admin/tickets" },
    ];


  return (
    <div className="min-h-screen bg-background-secondary flex transition-colors duration-300">
      
      {/* دکمه باز کردن سایدبار در موبایل */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 right-4 z-50 p-2.5 bg-card border border-border rounded-xl shadow-lg md:hidden hover:bg-secondary transition-colors"
      >
        <Menu className="w-6 h-6 text-foreground" />
      </button>

      {/* سایدبار موبایل (اورلی) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-72 bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-black">A</div>
                <span className="font-black text-foreground">پنل ادمین</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-secondary rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-foreground-secondary hover:bg-secondary"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-border">
              <button onClick={logout} className="flex items-center gap-3 px-4 py-3.5 text-error hover:bg-error/10 rounded-xl w-full transition-colors font-bold">
                <LogOut className="w-5 h-5" />
                خروج از پنل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* سایدبار دسکتاپ */}
      <aside className="w-64 bg-card border-l border-border hidden md:flex flex-col fixed h-full z-40 shadow-xl">
        <div className="p-6 flex items-center gap-3 border-b border-border">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
            A
          </div>
          <div>
            <h1 className="font-black text-foreground">پنل مدیریت</h1>
            <p className="text-xs text-foreground-muted">مرکز تک</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-foreground-secondary hover:bg-secondary"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error/10 rounded-xl w-full transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            خروج از پنل
          </button>
        </div>
      </aside>

      {/* محتوا */}
      <main className="flex-1 md:mr-64 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
