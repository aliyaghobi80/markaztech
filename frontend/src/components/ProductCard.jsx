// مسیر: src/components/ProductCard.jsx
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const imageUrl = product.main_image; 

 // ...
return (
    // تغییر: bg-card text-card-foreground border-border
    <div className="group relative bg-card text-card-foreground rounded-2xl border border-border shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden">
      
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <Link href={`/product/${product.slug}`}>
            <img src={imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        </Link>
        {/* ... بج‌ها ... */}
      </div>

        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-foreground-muted bg-secondary px-2 py-1 rounded-md">
                  {product.category && typeof product.category === 'object' 
                    ? (product.category.name || 'بدون دسته') 
                    : (product.category || 'بدون دسته')}
              </span>
          </div>

        <Link href={`/product/${product.slug}`}>
            <h3 className="font-bold mb-2 line-clamp-2 text-foreground hover:text-primary transition-colors min-h-[3rem]">
            {product.title}
            </h3>
        </Link>

        <div className="mt-auto pt-4 border-t border-border flex items-end justify-between">
            <div className="flex flex-col">
                {product.discount_price ? (
                    <>
                        <span className="text-xs text-foreground-muted line-through decoration-red-400">
                            {formatPrice(product.price)}
                        </span>
                        <span className="text-lg font-black text-foreground">
                            {formatPrice(product.discount_price)} <span className="text-xs font-normal text-foreground-muted">تومان</span>
                        </span>
                    </>
                ) : (
                    <span className="text-lg font-black text-foreground">
                        {formatPrice(product.price)} <span className="text-xs font-normal text-foreground-muted">تومان</span>
                    </span>
                )}
            </div>

            {/* تغییر: bg-primary text-primary-foreground */}
            <button 
                onClick={(e) => {
                    e.preventDefault();
                    addToCart(product);
                    toast.success('به سبد اضافه شد');
                }}
                className="bg-primary text-primary-foreground hover:bg-primary-hover p-3 rounded-xl transition-all shadow-theme hover:scale-105 active:scale-95"
            >
                <ShoppingCart className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
}