'use client';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/hooks/useStore';
import { useInView } from 'react-intersection-observer'; // <--- Import this
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useProducts();

  // The "ref" is the sensor. "inView" is true when sensor is on screen.
  const { ref, inView } = useInView();

  // Trigger fetch when user scrolls to bottom
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  // Flatten the pages: [[products_page_1], [products_page_2]] -> [all_products]
  const products = data?.pages.flatMap((page) => page.results) || [];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        
        {/* Header */}
        <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-8">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-zinc-900 dark:text-white mb-4">
              New Arrivals<span className="text-indigo-600">.</span>
            </h1>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-lg leading-relaxed">
              Curated essentials for the modern developer.
            </p>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8">
          {isLoading ? (
             // Initial Loading Skeletons
             [...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-zinc-200 dark:bg-zinc-800 aspect-[4/5] rounded-xl mb-4"></div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 w-3/4 rounded mb-2"></div>
                </div>
             ))
          ) : (
            products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>

        {/* Infinite Scroll Sensor & Loader */}
        <div ref={ref} className="mt-16 flex justify-center w-full">
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm font-medium">Loading more products...</span>
            </div>
          )}
          
          {!hasNextPage && products.length > 0 && (
            <p className="text-zinc-400 text-sm">You've reached the end.</p>
          )}
        </div>
      </main>
    </div>
  );
}