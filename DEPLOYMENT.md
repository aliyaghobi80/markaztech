# راهنمای دیپلوی MarkazTech روی cPanel

## پیش‌نیازها
- دسترسی به cPanel با Python و Node.js
- دیتابیس MySQL
- دسترسی SSH (ترجیحا)

---

## بخش اول: دیپلوی Backend (Django)

### ۱. آپلود فایل‌ها
1. فولدر `backend` را زیپ کنید
2. در cPanel به File Manager بروید
3. فایل‌ها را در `public_html/api` آپلود و Extract کنید

### ۲. ساخت Virtual Environment
```bash
cd ~/public_html/api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### ۳. تنظیم دیتابیس MySQL
1. در cPanel یک دیتابیس MySQL بسازید
2. یک کاربر دیتابیس بسازید و به دیتابیس دسترسی دهید
3. فایل `.env` را در فولدر backend بسازید:

```env
DEBUG=False
SECRET_KEY=یک-کلید-امن-50-کاراکتری-تولید-کنید
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,api.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

4. در `settings.py` دیتابیس را تنظیم کنید:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'your_database_name',
        'USER': 'your_database_user',
        'PASSWORD': 'your_database_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

### ۴. اجرای Migrations
```bash
source venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

### ۵. تنظیم Python App در cPanel
1. به Setup Python App بروید
2. یک اپلیکیشن جدید بسازید:
   - Python version: 3.10+
   - Application root: public_html/api
   - Application URL: api.yourdomain.com
   - Application startup file: passenger_wsgi.py
   - Application Entry point: application

### ۶. تنظیم .htaccess
فایل `.htaccess` در فولدر `backend` را ویرایش کنید و مسیرها را به مسیر واقعی تغییر دهید.

---

## بخش دوم: دیپلوی Frontend (Next.js)

### روش ۱: استفاده از Node.js در cPanel

1. فایل `.env.local` بسازید:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_MEDIA_URL=https://api.yourdomain.com
```

2. Build بگیرید:
```bash
cd frontend
npm install
npm run build
```

3. فولدر `.next/standalone` را به سرور آپلود کنید

4. در cPanel از Setup Node.js App استفاده کنید:
   - Application root: public_html (یا subdomain)
   - Application startup file: server.js

### روش ۲: Export Static (ساده‌تر)

1. در `next.config.mjs` تغییر دهید:
```js
const nextConfig = {
  output: 'export',
  // ...
};
```

2. Build بگیرید:
```bash
npm run build
```

3. محتوای فولدر `out` را در `public_html` آپلود کنید

---

## نکات مهم امنیتی

1. **SECRET_KEY**: حتما یک کلید امن ۵۰ کاراکتری تولید کنید
2. **DEBUG**: در پروداکشن حتما `False` باشد
3. **HTTPS**: مطمئن شوید SSL فعال است
4. **Database**: از رمز عبور قوی استفاده کنید

---

## عیب‌یابی

### خطای 500
- لاگ‌ها را در cPanel بررسی کنید
- مطمئن شوید دیتابیس درست تنظیم شده
- دسترسی فایل‌ها را چک کنید (755 برای فولدرها، 644 برای فایل‌ها)

### خطای CORS
- مطمئن شوید `CORS_ALLOWED_ORIGINS` درست تنظیم شده
- آدرس‌ها با https شروع شوند

### عکس‌ها لود نمی‌شوند
- مسیر `MEDIA_ROOT` را چک کنید
- دسترسی فولدر media را بررسی کنید

---

## دستورات مفید

```bash
# ورود به virtual environment
source venv/bin/activate

# اجرای migrations
python manage.py migrate

# جمع‌آوری static files
python manage.py collectstatic --noinput

# ساخت superuser
python manage.py createsuperuser

# بررسی خطاها
python manage.py check --deploy
```
