// مسیر: src/lib/utils.js

export const formatPrice = (price) => {
    if (!price) return "0";
    return Number(price).toLocaleString("fa-IR");
};

export const calculateDiscount = (price, discountPrice) => {
    if (!discountPrice) return 0;
    const discount = ((price - discountPrice) / price) * 100;
    return Math.round(discount);
};

export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // اگر URL کامل است، همان را برگردان
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        // تبدیل testserver به آدرس واقعی
        return imagePath.replace('http://testserver', 'http://127.0.0.1:8000');
    }
    
    // اگر مسیر نسبی است، آدرس کامل بساز
    if (imagePath.startsWith('/media/')) {
        return `http://127.0.0.1:8000${imagePath}`;
    }
    
    // اگر فقط نام فایل است
    return `http://127.0.0.1:8000/media/${imagePath}`;
};