"use client";
import Link from "next/link";
import { Mail, Phone, MapPin, Instagram, Send, Shield, Clock, HeadphonesIcon } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const persianYear = currentYear - 621;
  
  return (
    <footer className="bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <span className="text-3xl font-black">
                <span className="text-blue-500">Markaz</span>
                <span className="text-white">Tech</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              مرکز تخصصی فروش اکانت‌های پریمیوم هوش مصنوعی و نرم‌افزارهای دیجیتال با ضمانت اصالت و پشتیبانی ۲۴ ساعته
            </p>
            <div className="flex items-center gap-3">
              <a href="https://t.me/markaztech" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-colors">
                <Send className="w-5 h-5" />
              </a>
              <a href="https://instagram.com/markaztech.ir" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 hover:bg-pink-600 rounded-xl flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-sm"></span>
              دسترسی سریع
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/search" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2">
                  <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                  همه محصولات
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2">
                  <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                  پنل کاربری
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2">
                  <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                  سبد خرید
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2">
                  <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                  ثبت‌نام
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-sm"></span>
              چرا مرکزتک؟
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-400 text-sm">
                <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>ضمانت اصالت کالا</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm">
                <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>تحویل آنی و خودکار</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm">
                <HeadphonesIcon className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <span>پشتیبانی ۲۴/۷</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-sm"></span>
              راه‌های ارتباطی
            </h4>
            <ul className="space-y-4">
              <li>
                <a href="mailto:info@markaztech.ir" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-sm">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span dir="ltr">info@markaztech.ir</span>
                </a>
              </li>
              <li>
                <a href="tel:+989174320243" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-sm">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span dir="ltr">0917 432 0243</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-slate-400 text-sm">
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>ایران، فارس</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm text-center md:text-right">
            تمامی حقوق این وبسایت متعلق به <span className="text-white font-medium">مرکزتک</span> می‌باشد. © {persianYear}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-slate-600 text-xs">markaztech.ir</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
