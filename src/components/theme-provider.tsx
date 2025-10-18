// src/components/theme-provider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

// Advanced theme hook with additional features
export function useTheme() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const context = useContext(ThemeContext);
  if (!context && mounted) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}

// Theme context for advanced features
const ThemeContext = createContext<{
  theme: string;
  setTheme: (theme: string) => void;
  systemTheme?: string;
  resolvedTheme?: string;
} | null>(null);