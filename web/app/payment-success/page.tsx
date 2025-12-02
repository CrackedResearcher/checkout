'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation'; // <--- 1. Import this
import { Check, ArrowRight, Package, Receipt } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Suspense } from 'react'; // <--- 2. Good practice for search params

function SuccessContent() {
  const searchParams = useSearchParams();
  // 3. Get the order_id from URL (e.g. ?order_id=123)
  const orderId = searchParams.get('order_id'); 

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      <Navbar />
      
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-10px)] px-4 relative overflow-hidden">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        {/* Success Card */}
        <div className="max-w-sm w-full bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 text-center shadow-lg shadow-zinc-200/50 dark:shadow-black/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Animated Icon */}
          <div className="mx-auto mb-6 w-16 h-16 bg-green-500/10 dark:bg-green-500/20 rounded-full flex items-center justify-center ring-1 ring-green-500/50 ring-offset-4 ring-offset-white dark:ring-offset-zinc-950">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400 stroke-[3px]" />
          </div>
          
          <h1 className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white mb-2">
            Payment Successful<span className="text-indigo-600">.</span>
          </h1>
          
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 leading-relaxed">
            We have received your order and sent a confirmation email to you.
          </p>

          {/* Receipt / Info Box */}
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl p-3 mb-6">
             <div className="flex items-center gap-3">
                {/* Icon Box */}
                <div className="bg-white dark:bg-zinc-800 h-10 w-10 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 flex-shrink-0">
                    <Receipt className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                </div>
                
                {/* Text Content */}
                <div className="text-left flex-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Order Reference</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white font-mono">
                        {/* 4. Display the ID or a placeholder */}
                        {orderId ? `#${orderId}` : "#PROCESSING"}
                    </p>
                </div>
             </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2.5">
            <Link 
              href="/" 
              className="group w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 h-11 rounded-lg font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Continue Shopping 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="/orders" 
              className="w-full flex items-center justify-center gap-2 bg-white dark:bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 h-11 rounded-lg font-medium text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <Package className="w-4 h-4" />
              View Orders
            </Link>
          </div>
        </div>
        
        <p className="mt-6 text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
            Secure Encryption
        </p>

      </main>
    </div>
  );
}

// 5. Wrap in Suspense to prevent build errors with useSearchParams
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}