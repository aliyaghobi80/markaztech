import { Vazirmatn } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { LoadingProvider } from "@/context/LoadingContext";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/ThemeProvider";
import LayoutContent from "@/components/LayoutContent";
// تنظیم فونت وزیر
const vazir = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazir", // این متغیر را در CSS استفاده می‌کنیم
  display: "swap",
});

export const metadata = {
  title: "MarkazTech | مرکز تک",
  description: "فروشگاه محصولات دیجیتال و هوش مصنوعی",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={vazir.className} >
        {/* 2. اضافه کردن تم پرووایدر */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LoadingProvider>
            <AuthProvider>
                <CartProvider>
                  <Toaster 
                    position="top-left" 
                    toastOptions={{
                      style: {
                        fontFamily: 'var(--font-vazir)', // هماهنگی با فونت سایت
                        background: '#333',
                        color: '#fff',
                      },
                    }}
                  />

                  <LayoutContent>
                    {children}
                  </LayoutContent>
                </CartProvider>
            </AuthProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}