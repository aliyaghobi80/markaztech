// مسیر: src/app/cart/page.jsx
"use client";

import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function CartPage() {
    const { cart, addToCart, removeFromCart, clearCart, totalPrice, isAllFree } = useCart();
    const { user } = useAuth(); // چک میکنیم کاربر لاگین هست یا نه
    const { showLoading, hideLoading } = useLoading();
    const router = useRouter();
    
    const handleCheckout = async () => {
        if (!user) {
            router.push("/login");
            return;
        }

        showLoading(); // شروع لودینگ global

        try {
            // آماده‌سازی دیتا برای ارسال به بک‌اند
            const cartData = {
                cart_items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity
                }))
            };

            // ارسال درخواست
            const response = await api.post("/orders/", cartData);

            if (response.status === 201) {
                toast.success("سفارش ثبت شد. انتقال به صفحه پرداخت...", {
                    icon: '✅',
                });

                // انتقال به صفحه پرداخت (سبد خرید بعداً پاک می‌شه)
                router.push(`/checkout/${response.data.id}`);
            }
        } catch (error) {
            console.error("خطا در ثبت سفارش:", error);
            toast.error("مشکلی در ثبت سفارش پیش آمد. لطفا دوباره تلاش کنید.");
        } finally {
            hideLoading(); // پایان لودینگ
        }
    };

    // تابع کم کردن تعداد (اگر ۱ بود حذفش میکنه)
    const decreaseQuantity = (item) => {
        if (item.quantity > 1) {
            // اینجا باید منطق کاهش را در Context اضافه میکردیم، ولی فعلا با حذف و اضافه شبیه سازی میکنیم
            // اما چون Context ما فقط addToCart افزایشی دارد، بهتر است تابع decrease هم به Context اضافه شود.
            // فعلا برای سادگی، فقط دکمه حذف داریم. (در گام بعدی Context را کامل میکنیم)
            removeFromCart(item.id); // موقت: کل آیتم را حذف میکند
        } else {
            removeFromCart(item.id);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
                <div className="bg-primary/10 p-6 rounded-full mb-6">
                    <ShoppingBag className="w-16 h-16 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">سبد خرید شما خالی است!</h1>
                <p className="text-foreground-muted mb-8">می‌توانید همین الان محصولات جذابی پیدا کنید.</p>
                <Link href="/" className="btn-primary px-8 py-3 rounded-xl">
                    مشاهده محصولات
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-secondary py-12">
            <div className="container mx-auto px-4">
                <h1 className="text-2xl font-black text-foreground mb-8 flex items-center gap-2">
                    <span className="w-3 h-8 bg-primary rounded-sm"></span>
                    سبد خرید شما
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* لیست محصولات */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => (
                            <div key={item.id} className="card-base p-4 rounded-2xl flex items-center gap-4 shadow-theme">

                                {/* عکس محصول */}
                                <div className="w-24 h-24 bg-secondary rounded-xl overflow-hidden flex-shrink-0">
                                    <img src={item.main_image} alt={item.title} className="w-full h-full object-cover" />
                                </div>

                                {/* اطلاعات */}
                                <div className="flex-1">
                                    <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                                    <p className="text-sm text-foreground-muted mb-2">{item.category?.name || item.category}</p>
                                    <div className="text-primary font-bold">
                                        {(() => {
                                            const finalPrice = item.discount_price !== null && item.discount_price !== undefined 
                                                ? item.discount_price 
                                                : item.price;
                                            return finalPrice === 0 ? 'رایگان' : `${formatPrice(finalPrice)} تومان`;
                                        })()}
                                    </div>
                                </div>

                                {/* کنترل تعداد */}
                                <div className="flex flex-col items-end gap-3">
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>

                                    <div className="flex items-center gap-3 bg-secondary rounded-lg p-1">
                                        <span className="font-bold w-6 text-center text-foreground">{item.quantity}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* فاکتور نهایی */}
                    <div className="lg:col-span-1">
                        <div className="card-base p-6 rounded-3xl shadow-theme sticky top-24">
                            <h3 className="font-bold text-foreground mb-6 border-b border-border pb-4">خلاصه سفارش</h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-foreground-muted">
                                    <span>تعداد اقلام:</span>
                                    <span>{cart.length} محصول</span>
                                </div>
                                <div className="flex justify-between text-foreground font-bold text-lg">
                                    <span>مبلغ قابل پرداخت:</span>
                                    <span className={`${totalPrice === 0 ? 'text-success' : 'text-primary'}`}>
                                        {totalPrice === 0 ? 'رایگان' : `${formatPrice(totalPrice)} تومان`}
                                    </span>
                                </div>
                                {isAllFree && (
                                    <div className="bg-success/10 border border-success/20 rounded-xl p-3 text-center">
                                        <p className="text-success text-sm font-medium">
                                            🎉 تمام محصولات سبد خرید شما رایگان هستند!
                                        </p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="btn-primary w-full py-4 rounded-xl shadow-theme-lg">
                                {totalPrice === 0 ? 'دریافت رایگان' : 'ادامه جهت تسویه حساب'}
                            </button>
                            <p className="text-xs text-foreground-muted mt-4 text-center">
                                کالاهای موجود در سبد خرید شما ثبت و رزرو نشده‌اند.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}