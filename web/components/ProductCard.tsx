"use client";
import { Product } from "@/types";
import { useCartActions } from "@/hooks/useStore";
import { Plus } from "lucide-react";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCartActions();

  return (
    <div className="group relative flex flex-col gap-3">
      {/* Image Container */}
      <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900 relative border border-transparent dark:border-zinc-800">
        {product.thumbnail_url ? (
          <img
            src={product.thumbnail_url}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-zinc-300 dark:text-zinc-700 font-medium">
            No Image
          </div>
        )}

        {/* Floating Quick Add Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            addToCart.mutate({ product_id: product.id, quantity: 1 });
          }}
          className="absolute bottom-4 right-4 bg-white dark:bg-zinc-800 text-black dark:text-white p-3 rounded-full shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Product Info */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {product.name}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-1">
            {product.description}
          </p>
        </div>
        <p className="text-base font-bold text-zinc-900 dark:text-white">
          ${product.price}
        </p>
      </div>
    </div>
  );
}