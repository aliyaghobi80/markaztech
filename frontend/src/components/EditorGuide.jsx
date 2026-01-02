// مسیر: src/components/EditorGuide.jsx
"use client";

import { useState } from 'react';
import { 
  HelpCircle, X, Image, Video, Music, Link, 
  Bold, Italic, Underline, AlignCenter, List,
  Palette, Code, Table, Quote
} from 'lucide-react';

export default function EditorGuide() {
  const [isOpen, setIsOpen] = useState(false);

  const features = [
    {
      icon: <Bold className="w-5 h-5" />,
      title: "فرمت‌دهی متن",
      description: "بولد، ایتالیک، زیرخط‌دار، خط‌خورده و تغییر اندازه فونت"
    },
    {
      icon: <Palette className="w-5 h-5" />,
      title: "رنگ‌بندی",
      description: "تغییر رنگ متن و پس‌زمینه با پالت رنگ‌های متنوع"
    },
    {
      icon: <Image className="w-5 h-5" />,
      title: "مدیریت تصاویر",
      description: "آپلود، تغییر اندازه، برش، چرخش و اعمال فیلتر روی عکس‌ها"
    },
    {
      icon: <Video className="w-5 h-5" />,
      title: "رسانه چندگانه",
      description: "درج ویدیو، فایل صوتی و سایر انواع رسانه"
    },
    {
      icon: <Link className="w-5 h-5" />,
      title: "لینک‌سازی",
      description: "اضافه کردن لینک با پیش‌نمایش خودکار"
    },
    {
      icon: <AlignCenter className="w-5 h-5" />,
      title: "تراز متن",
      description: "چپ‌چین، راست‌چین، وسط‌چین و تراز کامل"
    },
    {
      icon: <List className="w-5 h-5" />,
      title: "لیست‌ها",
      description: "لیست نقطه‌ای، شماره‌دار و چندسطحی"
    },
    {
      icon: <Table className="w-5 h-5" />,
      title: "جدول",
      description: "ایجاد و ویرایش جداول با امکانات پیشرفته"
    },
    {
      icon: <Code className="w-5 h-5" />,
      title: "کد نویسی",
      description: "درج کد با syntax highlighting برای زبان‌های مختلف"
    },
    {
      icon: <Quote className="w-5 h-5" />,
      title: "نقل قول",
      description: "بلوک نقل قول با استایل حرفه‌ای"
    }
  ];

  const shortcuts = [
    { key: "Ctrl + B", action: "بولد کردن متن" },
    { key: "Ctrl + I", action: "ایتالیک کردن متن" },
    { key: "Ctrl + U", action: "زیرخط‌دار کردن متن" },
    { key: "Ctrl + Z", action: "بازگشت" },
    { key: "Ctrl + Y", action: "تکرار" },
    { key: "Ctrl + A", action: "انتخاب همه" },
    { key: "Ctrl + S", action: "ذخیره" },
    { key: "F11", action: "تمام صفحه" }
  ];

  return (
    <>
      {/* دکمه راهنما */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-40"
        title="راهنمای استفاده از ویرایشگر"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {/* مودال راهنما */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* هدر */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground">راهنمای ویرایشگر حرفه‌ای</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              
              {/* ویژگی‌ها */}
              <section>
                <h3 className="text-xl font-bold text-foreground mb-4">ویژگی‌های ویرایشگر</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg">
                      <div className="text-primary mt-1">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-1">{feature.title}</h4>
                        <p className="text-sm text-foreground-muted">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* میانبرهای کیبورد */}
              <section>
                <h3 className="text-xl font-bold text-foreground mb-4">میانبرهای کیبورد</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <span className="text-foreground">{shortcut.action}</span>
                      <kbd className="px-2 py-1 bg-background border border-border rounded text-sm font-mono">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </section>

              {/* نکات مهم */}
              <section>
                <h3 className="text-xl font-bold text-foreground mb-4">نکات مهم</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">آپلود تصاویر</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      می‌توانید تصاویر را با drag & drop یا از طریق دکمه آپلود اضافه کنید. 
                      حداکثر سایز مجاز 50MB است.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">ویرایش تصاویر</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      پس از درج تصویر، روی آن کلیک کنید تا ابزارهای ویرایش (برش، چرخش، فیلتر) نمایش داده شود.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">ذخیره خودکار</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      تغییرات شما به صورت خودکار ذخیره می‌شود. برای ذخیره دستی از Ctrl+S استفاده کنید.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">کپی از Word</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      هنگام کپی کردن از Word، فرمت‌بندی اصلی حفظ می‌شود. 
                      برای حذف فرمت‌بندی اضافی از دکمه "Clear Formatting" استفاده کنید.
                    </p>
                  </div>
                </div>
              </section>

              {/* دکمه بستن */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  متوجه شدم
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}