"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import {
  useCart,
  useCartActions,
  useCoupon,
  useCheckout,
} from "@/hooks/useStore";
import {
  Trash2,
  ArrowRight,
  Minus,
  Plus,
  Sparkles,
  Tag,
  ShoppingBag,
  X,
  InfoIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import clsx from "clsx";

export default function CartPage() {
  const { data: cartItems, isLoading } = useCart();
  const { removeFromCart, updateQuantity } = useCartActions();
  const generateCoupon = useCoupon();
  const checkout = useCheckout();

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponAwarded, setCouponAwarded] = useState(false);

  const subtotal =
    cartItems?.reduce((acc, item) => acc + (item.subtotal || 0), 0) || 0;

  const discountAmount = appliedCoupon ? subtotal * 0.1 : 0;
  const total = subtotal - discountAmount;

  const handleTryLuck = () => {
    generateCoupon.mutate(undefined, {
      onSuccess: (data) => {
        if (data.coupon_code) {
          setAppliedCoupon(data.coupon_code);
          setCouponInput(data.coupon_code);
          setCouponAwarded(true);
          toast.success("You got a reward!", {
            description: (
              <div className="mt-2 flex flex-col gap-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {data.message} You get ({data.discounted_percentage}) and your coupon has been applied already! 
                </p>
              </div>
            ),
            icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
          });
        } else {
          toast.message("Not this time…", {
            description:
              "Keep shopping to increase your chances of winning a coupon!",
            icon: <InfoIcon className="w-4 h-4 text-indigo-500" />,
          });
        }
      },
    });
  };

  const handleApplyCouponManual = () => {
    if (!couponInput) return;
    setAppliedCoupon(couponInput);
    toast.success("Coupon code added");
  };

  const handleCheckout = () => {
    checkout.mutate(appliedCoupon);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
          <div className="h-10 bg-zinc-100 dark:bg-zinc-900 w-48 rounded-lg mb-8 animate-pulse"></div>
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 bg-zinc-100 dark:bg-zinc-900 rounded-xl animate-pulse"
                ></div>
              ))}
            </div>
            <div className="lg:col-span-4 h-80 bg-zinc-100 dark:bg-zinc-900 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = !cartItems || cartItems.length === 0;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-zinc-900 dark:text-white mb-2">
              Shopping Bag<span className="text-indigo-600">.</span>
            </h1>
          </div>
          {!isEmpty && (
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-600 dark:text-zinc-400">
              {cartItems?.length} items
            </span>
          )}
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-24 border-t border-zinc-100 dark:border-zinc-800">
            <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-6 h-6 text-zinc-400 dark:text-zinc-600" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
              Your bag is empty
            </h2>
            <Link
              href="/"
              className="mt-4 group flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2.5 rounded-xl font-medium text-sm transition-all hover:scale-105"
            >
              Start Shopping
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-10 lg:items-start">
            <section className="lg:col-span-8">
              <ul className="space-y-3">
                {cartItems.map((item) => (
                  <li
                    key={item.id}
                    className="group flex gap-4 p-4 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all hover:border-zinc-300 dark:hover:border-zinc-700 cursor-default"
                  >
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                      {item.product.thumbnail_url ? (
                        <img
                          src={item.product.thumbnail_url}
                          alt={item.product.name}
                          className="h-full w-full object-contain p-2 mix-blend-multiply dark:mix-blend-normal"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] text-zinc-400">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col justify-between py-1">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="text-base font-bold text-zinc-900 dark:text-white leading-tight">
                            {item.product.name}
                          </h3>
                          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 max-w-[200px]">
                            {item.product.description}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-base font-bold text-zinc-900 dark:text-white">
                            ${Number(item.product.price).toLocaleString()}
                          </p>
                          {/* Mobile Remove Button (Top Right) */}
                          <button
                            onClick={() => removeFromCart.mutate(item.id)}
                            className="sm:hidden mt-2 p-1 text-zinc-400 hover:text-red-500 transition-colors ml-auto block"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-end justify-between mt-2">
                        {/* Compact Quantity Control */}
                        <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full p-1">
                          <button
                            onClick={() =>
                              updateQuantity.mutate({
                                id: item.id,
                                quantity: Math.max(1, (item.quantity || 1) - 1),
                              })
                            }
                            disabled={(item.quantity || 1) <= 1}
                            className="w-5 h-5 flex items-center justify-center cursor-pointer rounded-full bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shadow-sm hover:text-black dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <span className="w-5 text-center text-sm font-semibold text-zinc-900 dark:text-white">
                            {item.quantity || 1}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity.mutate({
                                id: item.id,
                                quantity: (item.quantity || 1) + 1,
                              })
                            }
                            className="w-5 h-5 flex items-center justify-center cursor-pointer rounded-full bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shadow-sm hover:text-black dark:hover:text-white transition-all"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart.mutate(item.id)}
                          className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-red-600 transition-colors cursor-pointer group/trash"
                        >
                          <Trash2 className="w-3.5 h-3.5 group-hover/trash:scale-110 transition-transform" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-10 lg:mt-0 lg:col-span-4">
              <div className="sticky top-28">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white mb-6">
                    Summary
                  </h2>

                  <div className="group relative overflow-hidden rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-900/10 p-4 mb-6 transition-all hover:border-indigo-200">
                    <div className="flex items-center gap-2 mb-2 text-indigo-900 dark:text-indigo-300">
                      <Sparkles className="w-3.5 h-3.5" />
                      <h3 className="font-bold text-xs uppercase tracking-wide">
                        Heads Up!
                      </h3>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mb-3 leading-relaxed">
                      Try your luck for a chance to win a coupon code. Roll the
                      dice and see if you unlock a reward.
                    </p>
                    <button
                      onClick={handleTryLuck}
                      disabled={generateCoupon.isPending}
                      className={clsx(
                        "w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                        generateCoupon.isPending
                          ? "bg-indigo-100 text-indigo-400 cursor-wait"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/10 active:scale-[0.98]"
                      )}
                    >
                      {generateCoupon.isPending ? "Rolling..." : "Try My Luck"}
                    </button>
                  </div>

                  <div className="space-y-3 py-6 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500 dark:text-zinc-400">
                        Subtotal
                      </span>
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        ${subtotal.toLocaleString()}
                      </span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                        <span className="flex items-center gap-2">
                          Discount{" "}
                          <span className="text-[10px] bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded font-bold uppercase">
                            {appliedCoupon}
                          </span>
                        </span>
                        <span>−${discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-end pt-2">
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">
                        Total
                      </span>
                      <span className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white">
                        $
                        {total.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>

                  {couponAwarded && (
                    <div className="flex gap-2 mb-6">
                      <input
                        type="text"
                        disabled
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="flex-1 px-3 py-2.5 bg-zinc-50 dark:text-gray-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-400"
                        placeholder="PROMO CODE"
                      />
                      <button
                        disabled
                        className="px-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg font-bold text-xs transition-all
             disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none disabled:hover:border-zinc-200 disabled:dark:hover:border-zinc-700"
                      >
                        APPLIED
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleCheckout}
                    disabled={checkout.isPending}
                    className="group w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3.5 text-sm font-bold shadow-lg shadow-zinc-200 dark:shadow-none hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {checkout.isPending ? (
                      "Processing..."
                    ) : (
                      <>
                        Checkout{" "}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <div className="mt-4 flex justify-center items-center gap-2 text-[10px] text-zinc-400 uppercase tracking-wide font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Secure Encryption
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
