"use client";

import Link from "next/link";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { ShoppingCart, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const imageUrl = product.main_image;
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPercent = hasDiscount ? calculateDiscount(product.price, product.discount_price) : 0;

  return (
    <div className="group relative bg-card text-card-foreground rounded-2xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden">
      
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <Link href={`/product/${product.slug}`}>
          <img 
            src={imageUrl} 
            alt={product.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>
        
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-md">
              {discountPercent}% تخفیف
            </span>
          )}
        </div>

        {product.delivery_time === 'آنی' && (
          <div className="absolute top-3 left-3">
            <span className="bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-md backdrop-blur-sm">
              <Zap className="w-3 h-3" />
              تحویل آنی
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-foreground-muted bg-secondary px-2.5 py-1 rounded-lg font-medium">
            {product.category}
          </span>
        </div>

        <Link href={`/product/${product.slug}`}>
          <h3 className="font-bold mb-2 line-clamp-2 text-foreground hover:text-primary transition-colors min-h-[3rem] text-sm leading-relaxed">
            {product.title}
          </h3>
        </Link>

        <div className="mt-auto pt-4 border-t border-border flex items-end justify-between">
          <div className="flex flex-col">
            {hasDiscount ? (
              <>
                <span className="text-xs text-foreground-muted line-through decoration-red-400">
                  {formatPrice(product.price)}
                </span>
                <span className="text-lg font-black text-foreground">
                  {formatPrice(product.discount_price)}
                  <span className="text-xs font-normal text-foreground-muted mr-1">تومان</span>
                </span>
              </>
            ) : (
              <span className="text-lg font-black text-foreground">
                {formatPrice(product.price)}
                <span className="text-xs font-normal text-foreground-muted mr-1">تومان</span>
              </span>
            )}
          </div>

          <button 
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
              toast.success('به سبد اضافه شد');
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 p-3 rounded-xl transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
            aria-label="افزودن به سبد خرید"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
