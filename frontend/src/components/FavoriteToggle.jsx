// مسیر: src/components/FavoriteToggle.jsx
"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { mutate } from "swr";

export default function FavoriteToggle({ productId, isFavoriteInitial, className = "" }) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(isFavoriteInitial);
  const [loading, setLoading] = useState(false);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("برای افزودن به علاقه‌مندی‌ها ابتدا وارد حساب خود شوید");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/products/favorites/toggle/", { product_id: productId });
      setIsFavorite(response.data.is_favorite);
      if (response.data.is_favorite) {
        toast.success("به لیست علاقه‌مندی‌ها اضافه شد");
      } else {
        toast.success("از لیست علاقه‌مندی‌ها حذف شد");
      }
      // Mutate favorites list in dashboard if open
      mutate("/products/favorites/");
    } catch (error) {
      toast.error("خطا در برقراری ارتباط");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`transition-all duration-300 ${loading ? "opacity-50" : "hover:scale-110 active:scale-95"} ${className}`}
      title={isFavorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
    >
      <Heart
        className={`w-6 h-6 ${isFavorite ? "fill-red-500 text-red-500" : "text-foreground-muted hover:text-red-500"}`}
      />
    </button>
  );
}
