"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useCart, useCartActions, useCoupon, useCheckout } from "@/hooks/useStore";
import { Trash2, ArrowRight, Minus, Plus, Sparkles, Tag } from "lucide-react";
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

  // Calculations
  const subtotal = cartItems?.reduce(
    (acc, item) => acc + Number(item.product.price) * item.quantity,
    0
  ) || 0;
  
  const discountAmount = appliedCoupon ? subtotal * 0.1 : 0; // 10% Logic
  const total = subtotal - discountAmount;

  // Handlers
  const handleTryLuck = () => {
    generateCoupon.mutate(undefined, {
      onSuccess: (data) => {
        if (data.coupon_code) {
          setAppliedCoupon(data.coupon_code);
          setCouponInput(data.coupon_code);
          toast.success("You are the Nth Customer!", {
            description: "10% Discount code applied automatically.",
            icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
          });
        } else {
          toast.message("Not this time...", {
            description: "Keep shopping to increase the global counter!",
          });
        }
      },
    });
  };

  const handleCheckout = () => {
    checkout.mutate(appliedCoupon);
  };

  const handleApplyCouponManual = () => {
    if (!couponInput) return;
    setAppliedCoupon(couponInput);
    toast.success("Coupon code added");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 pt-32 animate-pulse">
           <div className="h-10 bg-zinc-100 dark:bg-zinc-800 w-48 rounded mb-12"></div>
           <div className="grid lg:grid-cols-12 gap-12">
             <div className="lg:col-span-8 space-y-4">
                {[1,2].map(i => <div key={i} className="h-32 bg-zinc-100 dark:bg-zinc-800 rounded-xl"></div>)}
             </div>
             <div className="lg:col-span-4 h-64 bg-zinc-100 dark:bg-zinc-800 rounded-xl"></div>
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
        <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white mb-12">
          Shopping Bag <span className="text-zinc-400 font-medium text-2xl ml-2">({cartItems?.length || 0})</span>
        </h1>

        {isEmpty ? (
          <div className="text-center py-20 border-t border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-xl font-medium text-zinc-900 dark:text-white mb-4">Your bag is empty</h2>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-16 lg:items-start">
            
            {/* LEFT COLUMN: Cart Items */}
            <section className="lg:col-span-7">
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800 border-t border-b border-zinc-100 dark:border-zinc-800">
                {cartItems.map((item) => (
            <li key={item.id || `item-${item.id}`} className="flex py-8">
                    {/* Image */}
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                      {item.product.thumbnail_url ? (
                        <img
                          src={item.product.thumbnail_url}
                          alt={item.product.name}
                          className="h-full w-full object-cover object-center"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs text-zinc-400">No Img</div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="ml-6 flex flex-1 flex-col justify-between">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                            {item.product.name}
                          </h3>
                          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                             {item.product.description}
                          </p>
                        </div>
                        <p className="text-base font-bold text-zinc-900 dark:text-white">
                          ${item.product.price}
                        </p>
                      </div>

                      <div className="flex items-end justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 border border-zinc-200 dark:border-zinc-800 rounded-full px-3 py-1">
                            <button 
                                onClick={() => updateQuantity.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                                disabled={item.quantity <= 1}
                                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30"
                            >
                                <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium w-4 text-center dark:text-white">{item.quantity}</span>
                            <button 
                                onClick={() => updateQuantity.mutate({ id: item.id, quantity: item.quantity + 1 })}
                                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart.mutate(item.id)}
                          className="text-sm font-medium text-red-600 hover:text-red-500 flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> 
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* RIGHT COLUMN: Summary */}
            <section className="mt-16 lg:mt-0 lg:col-span-5">
              <div className="sticky top-24 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 backdrop-blur-sm">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Order Summary</h2>

                {/* --- Lucky Section --- */}
                <div className="relative overflow-hidden rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/20 p-5 mb-6">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-12 h-12 bg-indigo-500/20 blur-xl rounded-full"></div>
                    
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 text-sm">Every Nth Order Wins</h3>
                    </div>
                    <p className="text-xs text-indigo-700 dark:text-indigo-400/80 mb-3 leading-relaxed">
                        Test your luck. If you are the Nth customer globally, you get 10% off immediately.
                    </p>
                    <button
                        onClick={handleTryLuck}
                        disabled={generateCoupon.isPending}
                        className={clsx(
                            "w-full py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm",
                            generateCoupon.isPending 
                                ? "bg-indigo-200 text-indigo-800 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
                        )}
                    >
                        {generateCoupon.isPending ? "Checking Global Counter..." : "Try My Luck"}
                    </button>
                </div>

                {/* --- Coupon Input --- */}
                <div className="flex gap-2 mb-8">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Tag className="h-4 w-4 text-zinc-400" />
                        </div>
                        <input 
                            type="text" 
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            placeholder="Promo Code"
                        />
                    </div>
                    <button 
                        onClick={handleApplyCouponManual}
                        className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        Apply
                    </button>
                </div>

                {/* --- Totals --- */}
                <dl className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 pt-6">
                  <div className="flex justify-between">
                    <dt>Subtotal</dt>
                    <dd className="font-medium text-zinc-900 dark:text-white">${subtotal.toFixed(2)}</dd>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                        <dt className="flex items-center gap-1">
                             Discount <span className="text-xs bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">{appliedCoupon}</span>
                        </dt>
                        <dd>−${discountAmount.toFixed(2)}</dd>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4 items-center">
                    <dt className="text-base font-bold text-zinc-900 dark:text-white">Total</dt>
                    <dd className="text-xl font-black text-zinc-900 dark:text-white">${total.toFixed(2)}</dd>
                  </div>
                </dl>

                <div className="mt-8">
                  <button
                    onClick={handleCheckout}
                    disabled={checkout.isPending}
                    className="w-full flex items-center justify-center rounded-xl bg-zinc-900 dark:bg-white px-6 py-4 text-base font-bold text-white dark:text-zinc-900 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {checkout.isPending ? "Processing..." : "Checkout"} 
                    {!checkout.isPending && <ArrowRight className="ml-2 w-5 h-5"/>}
                  </button>
                  <p className="mt-4 text-center text-xs text-zinc-400">
                    Secure checkout powered by Stripe
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}