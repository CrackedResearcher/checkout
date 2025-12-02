"use client";
import Link from "next/link";
import { ShoppingBag, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "@/providers/Providers";
import { useCart } from "@/hooks/useStore";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { data: cartItems } = useCart();
  
  // 1. Destructure resolvedTheme
  const { setTheme, resolvedTheme } = useTheme(); 
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const cartCount = cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  // 2. Prevent Hydration Mismatch for Icons
  if (!mounted) {
    return (
      <nav className="fixed w-full z-50 top-0 border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
           {/* Render a skeleton or just the logo to prevent flickering */}
           <div className="text-xl font-black uppercase text-zinc-900 dark:text-white">FluxStore.</div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="fixed w-full z-50 top-0 border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-black tracking-tighter uppercase text-zinc-900 dark:text-white">
          FluxStore<span className="text-indigo-600">.</span>
        </Link>

        <div className="flex items-center gap-6">
          {/* 3. Logic Update: Use resolvedTheme */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-zinc-600 dark:text-zinc-400"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          <Link href="/cart" className="relative group">
            <ShoppingBag className="w-6 h-6 text-zinc-700 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white transition" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white dark:ring-zinc-950">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-4 border-l border-zinc-200 dark:border-zinc-800 pl-6">
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hidden sm:block">
                {user.email}
              </span>
              <button
                onClick={logout}
                className="text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm font-semibold bg-zinc-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-full hover:opacity-90 transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}