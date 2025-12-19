// مسیر: src/lib/axios.js
import axios from "axios";

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    // اگر روی لوکال هاست نیستیم (مثلا در محیط Orchids یا با آی‌پی وصل شدیم)
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      // برای محیط Orchids که پورت‌ها در ساب‌دومین هستند
      if (hostname.includes("-3000")) {
        return `${protocol}//${hostname.replace("-3000", "-8000")}/api`;
      }
      return `${protocol}//${hostname}:8000/api`;
    }
  }
  return "http://localhost:8000/api";
};

const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// 2. اینترسپتور درخواست (Request Interceptor)
// قبل از اینکه درخواست بره، توکن رو میذاره توی هدر
api.interceptors.request.use(
  (config) => {
    // اگر در لوکال استوریج توکن داریم، برش دار
    // نکته: ممکنه اسمش رو چیز دیگه‌ای ذخیره کرده باشی، اینجا چک کن
    const token = localStorage.getItem("accessToken"); 
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. اینترسپتور پاسخ (Response Interceptor)
// اگر سرور ارور داد، اینجا چکش میکنیم
api.interceptors.response.use(
  (response) => response, // اگر همه چی اوکی بود، دست نزن
  (error) => {
    // اگر ارور 401 (Unauthorized) بود
    if (error.response && error.response.status === 401) {
      console.error("توکن منقضی یا نامعتبر است. خروج اجباری...");
      
      // توکن‌های خراب رو پاک کن
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // هدایت به صفحه ورود
      if (typeof window !== 'undefined' && window.location.pathname !== "/login") {
         window.location.href = "/login";
      }
    }
    
    // Log other errors for debugging
    if (error.response) {
      console.error(`API Error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;