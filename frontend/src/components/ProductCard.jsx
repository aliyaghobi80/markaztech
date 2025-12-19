// مسیر: src/components/ProductCard.jsx
"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import FavoriteToggle from "./FavoriteToggle";
import { AlertCircle, Zap } from "lucide-react";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const imageUrl = product.main_image; 
  
  const isLowStock = product.stock > 0 && product.stock <= 3;
  const isOutOfStock = product.stock === 0;

  return (
    <div className={`group relative bg-card text-card-foreground rounded-2xl border shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden ${isLowStock ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)] animate-pulse-subtle' : 'border-border'}`}>
      
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <Link href={`/product/${product.slug}`}>
            <img src={imageUrl} alt={product.title} className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${isOutOfStock ? 'grayscale opacity-60' : ''}`} />
        </Link>
        
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px] z-20">
            <span className="bg-destructive text-destructive-foreground px-4 py-2 rounded-full font-bold shadow-lg transform -rotate-12 border-2 border-destructive-foreground/20">
              اتمام موجودی
            </span>
          </div>
        )}

        {/* Low Stock Badge */}
        {isLowStock && !isOutOfStock && (
          <div className="absolute top-3 left-3 z-30">
            <div className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg animate-bounce">
              <Zap className="w-3 h-3 fill-white" />
              فقط {product.stock} عدد باقی مانده!
            </div>
          </div>
        )}
        
        {/* Favorite Toggle over image */}
        <div className="absolute top-3 right-3 z-10">
          <FavoriteToggle 
            productId={product.id} 
            isFavoriteInitial={product.is_favorite} 
            className="bg-card/80 backdrop-blur-sm p-2 rounded-xl shadow-sm border border-border/50"
          />
        </div>
      </div>

        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-foreground-muted bg-secondary px-2 py-1 rounded-md">
                  {product.category && typeof product.category === 'object' 
                    ? (product.category.name || 'بدون دسته') 
                    : (product.category || 'بدون دسته')}
              </span>
              {product.stock > 3 && (
                <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full font-medium">
                  موجود در انبار
                </span>
              )}
          </div>

        <Link href={`/product/${product.slug}`}>
            <h3 className={`font-bold mb-2 line-clamp-2 text-foreground hover:text-primary transition-colors min-h-[3rem] ${isOutOfStock ? 'opacity-70' : ''}`}>
            {product.title}
            </h3>
        </Link>

        <div className="mt-auto pt-4 border-t border-border flex items-end justify-between">
            <div className="flex flex-col text-right" dir="rtl">
                {product.discount_price ? (
                    <>
                        <span className="text-xs text-foreground-muted line-through decoration-red-400">
                            {formatPrice(product.price)}
                        </span>
                        <span className={`text-lg font-black ${isOutOfStock ? 'text-foreground-muted' : 'text-foreground'}`}>
                            {formatPrice(product.discount_price)} <span className="text-xs font-normal text-foreground-muted">تومان</span>
                        </span>
                    </>
                ) : (
                    <span className={`text-lg font-black ${isOutOfStock ? 'text-foreground-muted' : 'text-foreground'}`}>
                        {formatPrice(product.price)} <span className="text-xs font-normal text-foreground-muted">تومان</span>
                    </span>
                )}
            </div>

            <button 
                onClick={(e) => {
                    e.preventDefault();
                    if (isOutOfStock) {
                      toast.error('این محصول در حال حاضر موجود نیست');
                      return;
                    }
                    addToCart(product);
                    toast.success('به سبد اضافه شد');
                }}
                disabled={isOutOfStock}
                className={`${isOutOfStock ? 'bg-muted text-muted-foreground cursor-not-allowed grayscale' : 'bg-primary text-primary-foreground hover:bg-primary/90'} p-3 rounded-xl transition-all shadow-theme hover:scale-105 active:scale-95`}
            >
                <ShoppingCart className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
}
