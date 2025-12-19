// مسیر: src/context/CartContext.jsx
"use client";

  import { createContext, useContext, useState, useEffect, useMemo } from "react";
  import toast from "react-hot-toast";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // 1. بارگذاری سبد از حافظه مرورگر (موقع لود سایت)
  useEffect(() => {
    const savedCart = localStorage.getItem("markazCart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // 2. ذخیره در حافظه هر وقت سبد تغییر کرد
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("markazCart", JSON.stringify(cart));
    } else {
      localStorage.removeItem("markazCart");
    }
  }, [cart]);

    // افزودن محصول به سبد
    const addToCart = (product) => {
      setCart((prev) => {
        // چک کنیم آیا محصول قبلا هست؟
        const existingItem = prev.find((item) => item.id === product.id);
        
        if (existingItem) {
          // بررسی موجودی
          if (product.stock !== undefined && existingItem.quantity >= product.stock) {
            toast.error(`حداکثر موجودی این محصول ${product.stock} عدد می‌باشد`);
            return prev;
          }

          // اگر هست، تعدادش را زیاد کن
          return prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        // اگر نیست، جدید اضافه کن
        if (product.stock === 0) {
          toast.error("این محصول در حال حاضر موجود نیست");
          return prev;
        }
        return [...prev, { ...product, quantity: 1 }];
      });
    };

  // حذف محصول از سبد
  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  // پاک کردن کل سبد خرید
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("markazCart");
  };

  // محاسبه قیمت کل با useMemo برای بهینه‌سازی
  const totalPrice = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = item.discount_price || item.price;
      return total + price * item.quantity;
    }, 0);
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

// هوک اختصاصی برای استفاده راحت‌تر
export const useCart = () => useContext(CartContext);