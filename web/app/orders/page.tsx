'use client';

import { useQuery } from '@tanstack/react-query'; // or import from your hooks/useStore
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  AlertCircle, 
  Calendar,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { format } from 'date-fns';
import { OrderItem, Order } from '@/types';
import { useOrders } from '@/hooks/useStore';


// --- Helper for Status Colors ---
const getStatusConfig = (status: string) => {
  switch (status) {
    case 'PAID':
      return { label: 'Processing', icon: Package, color: 'text-indigo-600 bg-indigo-20 dark:bg-indigo-900/20 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' };
    case 'SHIPPED':
      return { label: 'In Transit', icon: Truck, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
    case 'DELIVERED':
      return { label: 'Delivered', icon: CheckCircle2, color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800' };
    case 'PENDING':
      return { label: 'Payment Pending', icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
    case 'CANCELLED':
    case 'REFUNDED':
      return { label: 'Cancelled', icon: XCircle, color: 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700' };
    case 'PAYMENT_FAILED':
      return { label: 'Payment Failed', icon: AlertCircle, color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800' };
    default:
      return { label: status, icon: Package, color: 'text-zinc-600 bg-zinc-50 border-zinc-200' };
  }
};

export default function OrdersPage() {
  const { data: orders, isLoading } = useOrders();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 pt-32 space-y-6">
          <div className="h-8 w-48 bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse mb-8" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 bg-zinc-100 dark:bg-zinc-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = !orders || orders.length === 0;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        
        {/* Header */}
        <div className="mb-10">
            <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white mb-2">
              Order History<span className="text-indigo-600">.</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              View the status of your recent purchases.
            </p>
        </div>

        {isEmpty ? (
          // --- Empty State ---
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6 text-zinc-400" />
            </div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">No orders found</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-xs">
              You haven't placed any orders yet.
            </p>
            <Link
              href="/"
              className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              Start Shopping <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          // --- Orders List ---
          <div className="space-y-6">
            {orders.map((order) => {
              const status = getStatusConfig(order.status);
              const StatusIcon = status.icon;

              return (
                <div 
                  key={order.id} 
                  className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm"
                >
                  
                  {/* Card Header (Meta Data) */}
                  <div className="bg-zinc-50/80 dark:bg-zinc-900/50 p-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-6 sm:gap-10">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide font-bold text-zinc-400 mb-1">Order Placed</p>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          {format(new Date(order.created_at), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide font-bold text-zinc-400 mb-1">Order #</p>
                        <p className="text-xs font-mono font-medium text-zinc-600 dark:text-zinc-300">
                          {order.id.toString().padStart(6, '0')}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide font-bold text-zinc-400 mb-1">Total</p>
                        <p className="text-xs font-black text-zinc-900 dark:text-white">
                          ${Number(order.final_amount).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={clsx(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide",
                      status.color
                    )}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {order.items.map((item) => (
                      <div key={item.id} className="p-5 flex gap-4 items-center hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                        {/* Thumbnail */}
                        <div className="h-16 w-16 flex-shrink-0 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-lg overflow-hidden">
                          {item.product.thumbnail_url ? (
                            <img 
                              src={item.product.thumbnail_url} 
                              alt={item.product.name}
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-300">No Img</div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                            {item.product.name}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                             <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Qty: <span className="text-zinc-900 dark:text-zinc-200 font-medium">{item.quantity}</span>
                             </p>
                             <span className="text-zinc-300 dark:text-zinc-700 text-[10px]">•</span>
                             <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Price: <span className="text-zinc-900 dark:text-zinc-200 font-medium">${Number(item.price_at_purchase_time).toLocaleString()}</span>
                             </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}