// src/components/dev-session-provider.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DevUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface DevSession {
  user?: DevUser;
  expires: string;
}

interface DevSessionContextType {
  data: DevSession | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

const DevSessionContext = createContext<DevSessionContextType>({
  data: null,
  status: "loading"
});

export function DevSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<DevSession | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    // Check if we're in development mode and have a dev session
    if (process.env.NODE_ENV === 'development') {
      const devUser = localStorage.getItem('dev-user');
      if (devUser) {
        try {
          const user = JSON.parse(devUser);
          setSession({
            user,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
          });
          setStatus("authenticated");
          return;
        } catch (error) {
          console.error('Error parsing dev user:', error);
        }
      }
    }
    
    setStatus("unauthenticated");
  }, []);

  return (
    <DevSessionContext.Provider value={{ data: session, status }}>
      {children}
    </DevSessionContext.Provider>
  );
}

export function useDevSession() {
  return useContext(DevSessionContext);
}

export function devSignIn(user: DevUser) {
  if (process.env.NODE_ENV === 'development') {
    localStorage.setItem('dev-user', JSON.stringify(user));
    window.location.reload();
  }
}

export function devSignOut() {
  if (process.env.NODE_ENV === 'development') {
    localStorage.removeItem('dev-user');
    window.location.reload();
  }
}