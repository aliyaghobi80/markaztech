# MarkazTech - مرکز تک

فروشگاه آنلاین محصولات دیجیتال و هوش مصنوعی

## 🚀 ویژگی‌های پروژه

### Backend (Django REST Framework)
- ✅ احراز هویت با JWT و شماره موبایل
- ✅ مدیریت کاربران با نقش‌های مختلف (ادمین/مشتری)
- ✅ سیستم محصولات با دسته‌بندی سلسله‌مراتبی
- ✅ مدیریت سفارشات با آپلود فیش پرداخت
- ✅ پنل ادمین کامل
- ✅ API امن با اعتبارسنجی کامل

### Frontend (Next.js 14)
- ✅ رابط کاربری مدرن و ریسپانسیو
- ✅ پشتیبانی از حالت تاریک/روشن
- ✅ سبد خرید با ذخیره‌سازی محلی
- ✅ احراز هویت یکپارچه
- ✅ پنل ادمین تعاملی
- ✅ بهینه‌سازی عملکرد

## 🛠 تکنولوژی‌های استفاده شده

### Backend
- Django 4.2+
- Django REST Framework
- JWT Authentication
- SQLite (قابل تغییر به PostgreSQL)
- Pillow (پردازش تصاویر)

### Frontend
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Lucide React (آیکون‌ها)
- Axios (HTTP Client)
- React Hot Toast (نوتیفیکیشن)

## 📦 نصب و راه‌اندازی

### پیش‌نیازها
- Python 3.8+
- Node.js 18+
- npm یا yarn

### Backend Setup

1. کلون کردن پروژه:
```bash
git clone <repository-url>
cd MarkazTech
```

2. ساخت محیط مجازی:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# یا
venv\Scripts\activate     # Windows
```

3. نصب وابستگی‌ها:
```bash
pip install -r requirements.txt
```

4. تنظیم متغیرهای محیطی:
```bash
cp .env.example .env
# ویرایش فایل .env با تنظیمات مورد نیاز
```

5. مایگریشن دیتابیس:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. ساخت سوپر یوزر:
```bash
python manage.py createsuperuser
```

7. اجرای سرور:
```bash
python manage.py runserver
```

### Frontend Setup

1. رفتن به پوشه frontend:
```bash
cd frontend
```

2. نصب وابستگی‌ها:
```bash
npm install
# یا
yarn install
```

3. اجرای سرور توسعه:
```bash
npm run dev
# یا
yarn dev
```

## 🔧 تنظیمات

### متغیرهای محیطی Backend
```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
```

### تنظیمات Frontend
- آدرس API در `src/lib/axios.js` قابل تنظیم است
- تم پیش‌فرض در `src/components/ThemeProvider.jsx`

## 📱 استفاده

### دسترسی‌ها
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Admin Panel**: http://localhost:8000/admin

### حساب‌های پیش‌فرض
پس از ساخت سوپر یوزر، می‌توانید از پنل ادمین استفاده کنید.

## 🏗 ساختار پروژه

```
MarkazTech/
├── backend/
│   ├── apps/
│   │   ├── users/          # مدیریت کاربران
│   │   ├── products/       # محصولات و دسته‌بندی
│   │   └── orders/         # سفارشات
│   ├── config/             # تنظیمات Django
│   ├── media/              # فایل‌های آپلودی
│   └── logs/               # لاگ‌های سیستم
├── frontend/
│   ├── src/
│   │   ├── app/            # صفحات Next.js
│   │   ├── components/     # کامپوننت‌های React
│   │   ├── context/        # Context API
│   │   └── lib/            # ابزارها و تنظیمات
│   └── public/             # فایل‌های استاتیک
└── README.md
```

## 🔒 امنیت

- احراز هویت JWT با Refresh Token
- اعتبارسنجی ورودی‌ها
- محدودیت دسترسی بر اساس نقش کاربر
- اعتبارسنجی فایل‌های آپلودی
- تنظیمات امنیتی برای production

## 🚀 Deploy

### Backend (Django)
1. تنظیم `DEBUG=False`
2. تنظیم `ALLOWED_HOSTS`
3. استفاده از دیتابیس production (PostgreSQL)
4. تنظیم فایل‌های استاتیک
5. استفاده از HTTPS

### Frontend (Next.js)
1. Build کردن پروژه: `npm run build`
2. Deploy روی Vercel، Netlify یا سرور شخصی

## 🤝 مشارکت

1. Fork کردن پروژه
2. ساخت branch جدید (`git checkout -b feature/AmazingFeature`)
3. Commit کردن تغییرات (`git commit -m 'Add some AmazingFeature'`)
4. Push کردن به branch (`git push origin feature/AmazingFeature`)
5. باز کردن Pull Request

## 📄 لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.

## 📞 پشتیبانی

برای سوالات و پشتیبانی:
- ایمیل: support@markaztech.ir
- تلگرام: @markaztech_support

---

**MarkazTech** - ساخته شده با ❤️ برای آینده دیجیتال