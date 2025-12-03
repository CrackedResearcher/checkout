"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";

interface AuthContextType {
  user: { email: string; id: number } | null;
  login: (
    accessToken: string,
    refreshToken: string,
    user: { email: string; id: number }
  ) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as any);
export const useAuth = () => useContext(AuthContext);

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ email: string; id: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user_data");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (accessToken: string, refreshToken: string, userData: any) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken); 
    localStorage.setItem("user_data", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
    setUser(null);
    window.location.href = "/login";
  };

  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
          {children}
          <Toaster
            position="top-center"
            theme="dark"
            className="toaster group"
            toastOptions={{
              classNames: {
                toast: 'group toast group-[.toaster]:bg-white group-[.toaster]:dark:bg-zinc-950 group-[.toaster]:border-zinc-200 group-[.toaster]:dark:border-zinc-800 group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl',
                description: 'group-[.toast]:text-zinc-500 group-[.toast]:dark:text-zinc-400',
                actionButton: 'group-[.toast]:bg-zinc-900 group-[.toast]:dark:bg-zinc-50 group-[.toast]:text-white group-[.toast]:dark:text-zinc-900',
                cancelButton: 'group-[.toast]:bg-zinc-100 group-[.toast]:dark:bg-zinc-800 group-[.toast]:text-zinc-500 group-[.toast]:dark:text-zinc-400',
                error: 'group-[.toaster]:text-red-600 dark:group-[.toaster]:text-red-400',
                success: 'group-[.toaster]:text-indigo-600 dark:group-[.toaster]:text-indigo-400',
                warning: 'group-[.toaster]:text-amber-600 dark:group-[.toaster]:text-amber-400',
                info: 'group-[.toaster]:text-blue-600 dark:group-[.toaster]:text-blue-400',
              },
            }}
          />
        </AuthContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
