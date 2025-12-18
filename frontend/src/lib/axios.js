// مسیر: src/lib/axios.js
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
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