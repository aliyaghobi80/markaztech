// مسیر: src/lib/axios.js
import axios from "axios";

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    // اگر روی لوکال هاست نیستیم (مثلا در محیط production)
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      // برای production - بدون پورت
      return `${protocol}//${hostname}/api`;
    }
  }
  // برای development
  return "http://localhost:8001/api";
};

const API_BASE_URL = getBaseUrl();

console.log('🔗 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // کاهش timeout از 30 ثانیه به 10 ثانیه
});

// 2. اینترسپتور درخواست (Request Interceptor)
// قبل از اینکه درخواست بره، توکن رو میذاره توی هدر
api.interceptors.request.use(
  (config) => {
    // اگر در لوکال استوریج توکن داریم، برش دار
    // نکته: ممکنه اسمش رو چیز دیگه‌ای ذخیره کرده باشی، اینجا چک کن
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken"); 
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. اینترسپتور پاسخ (Response Interceptor)
// اگر سرور ارور داد، اینجا چکش میکنیم
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// 3. اینترسپتور پاسخ (Response Interceptor)
// در حالت frontend-only، همه خطاهای API را handle می‌کنیم
api.interceptors.response.use(
  (response) => response, // اگر همه چی اوکی بود، دست نزن
  async (error) => {
    // در حالت frontend-only، همه خطاهای 404 را با mock data جواب بده
    if (process.env.NODE_ENV !== 'production' && error.response?.status === 404) {
      const url = error.config?.url || '';
      console.log('API 404 (frontend-only mode) - returning mock data for:', url);
      
      // User profile
      if (url.includes('/users/profile/')) {
        const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
        return Promise.resolve({
          data: {
            id: user.id || 1,
            full_name: user.full_name || 'کاربر تست',
            mobile: user.mobile || '09123456789',
            email: user.email || 'user@test.com',
            avatar_url: user.avatar_url || null,
            wallet_balance: user.wallet_balance || 50000,
            role: user.role || 'USER',
            is_admin: user.is_admin || false,
            is_staff: user.is_staff || false,
            is_superuser: user.is_superuser || false,
            created_at: user.created_at || new Date().toISOString(),
            updated_at: user.updated_at || new Date().toISOString()
          }
        });
      }
      
      // Site stats
      if (url.includes('/users/site-stats/')) {
        return Promise.resolve({
          data: {
            total_visits: 8547 + Math.floor(Math.random() * 100),
            today_visits: 234 + Math.floor(Math.random() * 20),
            online_users: 15 + Math.floor(Math.random() * 20),
            total_satisfied_customers: 756 + Math.floor(Math.random() * 50),
            satisfaction_rate: 95.5 + Math.random() * 4,
            total_votes: 789 + Math.floor(Math.random() * 30)
          }
        });
      }
      
      // Products
      if (url.includes('/products/') && !url.includes('/categories/')) {
        return Promise.resolve({
          data: {
            results: [
              {
                id: 1,
                title: 'محصول نمونه ۱',
                price: 150000,
                discount_price: 120000,
                image: '/placeholder-product.jpg',
                category: 'دیجیتال',
                is_active: true,
                stock: 10,
                description: 'توضیحات محصول نمونه',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              },
              {
                id: 2,
                title: 'محصول نمونه ۲',
                price: 250000,
                discount_price: null,
                image: '/placeholder-product.jpg',
                category: 'هوش مصنوعی',
                is_active: true,
                stock: 5,
                description: 'توضیحات محصول نمونه دوم',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ],
            count: 2
          }
        });
      }
      
      // Categories
      if (url.includes('/products/categories/')) {
        return Promise.resolve({
          data: [
            { 
              id: 1, 
              name: 'دیجیتال', 
              slug: 'digital',
              icon: null,
              children: [
                { id: 11, name: 'نرم افزار', slug: 'software' },
                { id: 12, name: 'بازی', slug: 'games' }
              ]
            },
            { 
              id: 2, 
              name: 'هوش مصنوعی', 
              slug: 'ai',
              icon: null,
              children: [
                { id: 21, name: 'چت بات', slug: 'chatbot' },
                { id: 22, name: 'تشخیص تصویر', slug: 'image-recognition' }
              ]
            },
            { 
              id: 3, 
              name: 'آموزش', 
              slug: 'education',
              icon: null,
              children: []
            }
          ]
        });
      }
      
      // Site settings
      if (url.includes('/users/site-settings/')) {
        return Promise.resolve({
          data: {
            site_name: 'مرکزتک',
            site_description: 'فروشگاه محصولات دیجیتال و هوش مصنوعی',
            site_logo_url: '/logo.png',
            contact_phone: '09174320243',
            contact_email: 'info@markaztech.ir'
          }
        });
      }
      
      // Admin status
      if (url.includes('/chat/admin-status/')) {
        return Promise.resolve({
          data: {
            is_online: true,
            last_seen: new Date().toISOString()
          }
        });
      }
      
      // Chat rooms
      if (url.includes('/chat/rooms/')) {
        return Promise.resolve({
          data: []
        });
      }
      
      // Wallet requests
      if (url.includes('/users/wallet-requests/')) {
        return Promise.resolve({
          data: {
            results: [],
            count: 0
          }
        });
      }
      
      // Tickets
      if (url.includes('/users/tickets/')) {
        return Promise.resolve({
          data: {
            results: [],
            count: 0
          }
        });
      }
      
      // Orders
      if (url.includes('/orders/')) {
        return Promise.resolve({
          data: {
            results: [],
            count: 0
          }
        });
      }
      
      // Default mock response
      return Promise.resolve({
        data: {
          message: 'Mock data (frontend-only mode)',
          results: [],
          count: 0
        }
      });
    }
    
    // سایر خطاها را نادیده بگیر
    console.log(`API Error ${error.response?.status || 'Network'} (frontend-only mode):`, error.config?.url);
    return Promise.reject(error);
  }
);

export default api;
