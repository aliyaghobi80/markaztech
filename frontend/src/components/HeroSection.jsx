// مسیر: src/components/HeroSection.jsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function HeroSection() {
  return (
    <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white overflow-hidden mb-12">
      {/* دایره‌های تزیینی پس‌زمینه */}

      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 opacity-10 rounded-full translate-y-1/3 -translate-x-1/4"></div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">

        {/* متن‌های بنر */}
        <div className="text-center md:text-right max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            دنیای هوش مصنوعی <br />
            <span className="text-blue-300">در دستان شماست</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
            دسترسی آنی به ChatGPT Plus، Midjourney و هزاران سرویس پریمیوم دیگر.
            <br className="hidden md:block" />
            با بهترین قیمت و تحویل فوری.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            {/* تغییر رنگ دکمه در حالت دارک */}
            <Link
              href="/products"
              className="px-8 py-4 bg-white text-blue-800 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg flex items-center gap-2"
            >
              مشاهده محصولات
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2 text-blue-200 text-sm font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              تحویل آنی و خودکار
            </div>
          </div>
        </div>

        {/* تصویر یا آیکون سمت چپ (می‌توانید بعدا عکس واقعی بگذارید) */}
        <div className="hidden md:block w-1/3">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-500"></div>
              <div>
                <div className="h-2 w-24 bg-white/50 rounded mb-2"></div>
                <div className="h-2 w-16 bg-white/30 rounded"></div>
              </div>
            </div>
            <div className="h-32 bg-white/10 rounded-xl mb-4"></div>
            <div className="h-4 w-full bg-white/30 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}