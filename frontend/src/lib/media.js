// مسیر: src/lib/media.js
const getMediaBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace('/api', '');
  }
  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    // اگر روی لوکال هاست نیستیم
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      // برای محیط Orchids که پورت‌ها در ساب‌دومین هستند
      if (hostname.includes("-3000")) {
        return `${protocol}//${hostname.replace("-3000", "-8001")}`;
      }
      return `${protocol}//${hostname}:8001`;
    }
  }
  return "http://localhost:8001";
};

export const getMediaUrl = (path) => {
  if (!path) return null;
  
  // اگر قبلاً URL کامل هست، همون رو برگردون
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // اگر با / شروع نمیشه، اضافه کن
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  const baseUrl = getMediaBaseUrl();
  const fullUrl = `${baseUrl}/media${cleanPath}`;
  
  return fullUrl;
};

export default { getMediaUrl };