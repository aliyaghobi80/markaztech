// صفحه تست تم‌ها - فقط برای توسعه
"use client";

export default function ThemeTestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        
        {/* عنوان */}
        <h1 className="text-3xl font-bold text-foreground mb-8">تست سیستم تم MarkazTech</h1>
        
        {/* رنگ‌های پس‌زمینه */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">پس‌زمینه‌ها</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-background p-4 border border-border rounded-lg">
              <p className="text-foreground text-sm">bg-background</p>
            </div>
            <div className="bg-background-secondary p-4 border border-border rounded-lg">
              <p className="text-foreground text-sm">bg-background-secondary</p>
            </div>
            <div className="bg-card p-4 border border-border rounded-lg">
              <p className="text-card-foreground text-sm">bg-card</p>
            </div>
            <div className="bg-secondary p-4 border border-border rounded-lg">
              <p className="text-secondary-foreground text-sm">bg-secondary</p>
            </div>
          </div>
        </section>

        {/* رنگ‌های متن */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">متن‌ها</h2>
          <div className="card-base p-6 space-y-2">
            <p className="text-foreground">متن اصلی - text-foreground</p>
            <p className="text-foreground-secondary">متن ثانویه - text-foreground-secondary</p>
            <p className="text-foreground-muted">متن کم‌اهمیت - text-foreground-muted</p>
            <p className="text-primary">متن با رنگ برند - text-primary</p>
          </div>
        </section>

        {/* دکمه‌ها */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">دکمه‌ها</h2>
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary">دکمه اصلی</button>
            <button className="btn-secondary">دکمه ثانویه</button>
            <button className="bg-success text-success-foreground px-4 py-2 rounded-lg">موفقیت</button>
            <button className="bg-warning text-warning-foreground px-4 py-2 rounded-lg">هشدار</button>
            <button className="bg-error text-error-foreground px-4 py-2 rounded-lg">خطا</button>
          </div>
        </section>

        {/* کارت‌ها */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">کارت‌ها</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-base p-6">
              <h3 className="text-foreground font-bold mb-2">کارت نمونه</h3>
              <p className="text-foreground-muted mb-4">این یک کارت نمونه است که از کلاس card-base استفاده می‌کند.</p>
              <button className="btn-primary">عملیات</button>
            </div>
            
            <div className="bg-primary text-primary-foreground p-6 rounded-lg">
              <h3 className="font-bold mb-2">کارت با رنگ اصلی</h3>
              <p className="opacity-90 mb-4">این کارت از رنگ اصلی برند استفاده می‌کند.</p>
              <button className="bg-primary-foreground text-primary px-4 py-2 rounded-lg">عملیات</button>
            </div>
          </div>
        </section>

        {/* حاشیه‌ها و سایه‌ها */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">حاشیه‌ها و سایه‌ها</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-base p-4">
              <p className="text-foreground text-sm">حاشیه عادی</p>
            </div>
            <div className="card-base p-4 shadow-theme">
              <p className="text-foreground text-sm">سایه عادی</p>
            </div>
            <div className="card-base p-4 shadow-theme-lg">
              <p className="text-foreground text-sm">سایه بزرگ</p>
            </div>
          </div>
        </section>

        {/* راهنما */}
        <section className="card-base p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">راهنمای استفاده</h2>
          <div className="text-foreground-muted space-y-2 text-sm">
            <p>• برای تغییر تم از دکمه تغییر تم در هدر استفاده کنید</p>
            <p>• همه رنگ‌ها از فایل globals.css کنترل می‌شوند</p>
            <p>• کلاس‌های آماده: btn-primary, btn-secondary, card-base</p>
            <p>• این صفحه فقط برای تست است و در پروداکشن حذف شود</p>
          </div>
        </section>

      </div>
    </div>
  );
}