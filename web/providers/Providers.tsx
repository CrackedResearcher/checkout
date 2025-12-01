"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";
import { Toaster } from "sonner"; // <--- New Toast Library
import { ThemeProvider } from "next-themes"; // <--- Dark Mode Provider

// --- Auth Context ---
interface AuthContextType {
  user: { email: string; id: number } | null;
  login: (token: string, user: { email: string; id: number }) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as any);
export const useAuth = () => useContext(AuthContext);

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ email: string; id: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydration fix for Auth
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user_data");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, userData: any) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user_data", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_data");
    setUser(null);
    window.location.href = "/login";
  };

  if (!mounted) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
          {children}
          {/* The new Toast UI */}
          <Toaster position="bottom-right" richColors closeButton theme="system" />
        </AuthContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}