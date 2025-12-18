// مسیر: src/app/admin/layout.jsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, Users, ShoppingBag, MessageSquare, 
  Ticket, CreditCard, LogOut, Package 
} from "lucide-react";
import { useEffect } from "react";

export default function AdminLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // محافظت از روت (فقط ادمین راه دارد)
  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'ADMIN') {
        router.push("/dashboard"); // پرت کردن کاربر عادی به بیرون
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'ADMIN') return null;

  const menuItems = [
    { name: "پیشخوان", icon: LayoutDashboard, href: "/admin" },
    { name: "مدیریت محصولات", icon: Package, href: "/admin/products" },
    { name: "مدیریت کاربران", icon: Users, href: "/admin/users" },
    { name: "سفارشات و پرداخت", icon: CreditCard, href: "/admin/orders" },
    { name: "نظرات", icon: MessageSquare, href: "/admin/comments" },
    { name: "تیکت‌ها", icon: Ticket, href: "/admin/tickets" },
  ];

  return (
    <div className="min-h-screen bg-background-secondary flex transition-colors duration-300">
      
      {/* سایدبار */}
      <aside className="w-64 bg-card border-l border-border hidden md:flex flex-col fixed h-full z-40 shadow-xl">
        <div className="p-6 flex items-center gap-3 border-b border-border">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
            A
          </div>
          <div>
            <h1 className="font-black text-foreground">پنل مدیریت</h1>
            <p className="text-xs text-foreground-muted">مدیریت فروشگاه</p>
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
      <main className="flex-1 md:mr-64 p-8">
        {children}
      </main>
    </div>
  );
}