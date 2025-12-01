"use client";

import { useEffect, useState } from "react";
import { getAuthToken, getAuthUser, clearAuthCookies, type User } from "@/lib/auth-cookies";
import { AuthPanel, Dashboard, HeroSection } from "@/components";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load session from cookies on mount
  useEffect(() => {
    const storedToken = getAuthToken();
    const storedUser = getAuthUser();
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null; // Prevent hydration mismatch
  }

  if (user && token) {
    return (
      <Dashboard
        user={user}
        onLogout={() => {
          clearAuthCookies();
          setUser(null);
          setToken(null);
        }}
      />
    );
  }

  return (
    <div className="container-centered bg-page font-sans">
      <main className="container-main section-gap">
        <HeroSection />
        <AuthPanel
          onAuthSuccess={(u, t) => {
            setUser(u);
            setToken(t);
          }}
        />
      </main>
    </div>
  );
}
