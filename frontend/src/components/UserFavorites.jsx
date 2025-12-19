// مسیر: src/components/UserFavorites.jsx
"use client";

import useSWR from "swr";
import api from "@/lib/axios";
import { Heart, ShoppingCart, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";

const fetcher = (url) => api.get(url).then((res) => res.data);

export default function UserFavorites() {
  const { data: favorites, error, mutate, isLoading } = useSWR("/products/favorites/", fetcher);
  const { addToCart } = useCart();

  const removeFavorite = async (productId) => {
    try {
      await api.post("/products/favorites/toggle/", { product_id: productId });
      toast.success("از لیست علاقه‌مندی‌ها حذف شد");
      mutate();
    } catch (error) {
      toast.error("خطا در حذف از علاقه‌مندی‌ها");
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-black text-foreground flex items-center gap-2 mb-6">
        <span className="w-2 h-8 bg-primary rounded-full"></span>
        علاقه‌مندی‌های من
      </h1>

      {favorites?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((fav) => (
            <div key={fav.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow group">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-secondary shrink-0">
                <img 
                  src={fav.product_details.main_image} 
                  alt={fav.product_details.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${fav.product_details.slug}`} className="font-bold text-foreground hover:text-primary transition-colors line-clamp-1 mb-1">
                  {fav.product_details.title}
                </Link>
                <p className="text-sm text-primary font-black mb-3">
                  {formatPrice(fav.product_details.discount_price || fav.product_details.price)} تومان
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      addToCart(fav.product_details);
                      toast.success("به سبد خرید اضافه شد");
                    }}
                    className="flex-1 bg-primary text-primary-foreground text-[10px] font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    خرید سریع
                  </button>
                  <button 
                    onClick={() => removeFavorite(fav.product)}
                    className="p-2 bg-secondary text-error rounded-lg hover:bg-error/10 transition-colors"
                    title="حذف از علاقه‌مندی‌ها"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
          <Heart className="w-16 h-16 mx-auto mb-4 opacity-20 text-foreground-muted" />
          <p className="text-foreground-muted">لیست علاقه‌مندی‌های شما خالی است</p>
          <Link href="/" className="text-primary hover:underline text-sm mt-2 inline-block">مشاهده محصولات</Link>
        </div>
      )}
    </div>
  );
}
