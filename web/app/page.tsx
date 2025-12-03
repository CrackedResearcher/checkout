'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/hooks/useStore';
import { Loader2 } from 'lucide-react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';

export default function Home() {
  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useProducts();

  const products = useMemo(() => 
    data?.pages.flatMap((page) => page.results) || [], 
  [data]);

  const [columns, setColumns] = useState(1);
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1024) setColumns(4);      
      else if (width >= 640) setColumns(2);  
      else setColumns(1);                    
    };
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const listRef = useRef<HTMLDivElement>(null);
  const [offsetTop, setOffsetTop] = useState(0);

  useEffect(() => {
    if (listRef.current) {
      setOffsetTop(listRef.current.offsetTop);
    }
  }, [listRef.current]);

  const totalRows = Math.ceil(products.length / columns);

  const virtualizer = useWindowVirtualizer({
    count: totalRows,
    estimateSize: () => 450, 
    overscan: 2,
    scrollMargin: offsetTop, 
  });

  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    const [lastItem] = [...virtualItems].reverse();
    if (!lastItem) return;

    if (
      lastItem.index >= totalRows - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage, totalRows, isFetchingNextPage, virtualItems]);

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
            Find the pieces you'll love - crafted with care, made to last.
            </p>
          </div>
        </div>

        {/* Product Grid Area */}
        <div ref={listRef}>
          {isLoading ? (
            // Skeleton Loader
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-zinc-200 dark:bg-zinc-800 aspect-[4/5] rounded-xl mb-4"></div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 w-3/4 rounded mb-2"></div>
                </div>
              ))}
            </div>
          ) : (
            // Virtualized Container
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualItems.map((virtualRow) => {
                const startIndex = virtualRow.index * columns;
                const rowProducts = products.slice(startIndex, startIndex + columns);

                return (
                  <div
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
                    }}
                    className="pb-12" 
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8">
                      {rowProducts.map((product: any) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Loader State */}
        <div className="mt-8 flex justify-center w-full h-10">
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm font-medium">Loading more products...</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}