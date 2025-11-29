"use client";

import { useState, useEffect } from "react";
import { AuthPanel, Dashboard, HeroSection, type User } from "@/components";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("auth_session");
    if (saved) {
      try {
        const { user: savedUser, token: savedToken } = JSON.parse(saved);
        setUser(savedUser);
        setToken(savedToken);
      } catch (e) {
        localStorage.removeItem("auth_session");
      }
    }
    setIsHydrated(true);
  }, []);

  // Save session to localStorage whenever auth state changes
  useEffect(() => {
    if (!isHydrated) return;
    if (user && token) {
      localStorage.setItem("auth_session", JSON.stringify({ user, token }));
    } else {
      localStorage.removeItem("auth_session");
    }
  }, [user, token, isHydrated]);

  if (!isHydrated) {
    return null; // Prevent hydration mismatch
  }

  if (user && token) {
    return (
      <Dashboard
        user={user}
        onLogout={() => {
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
          isLogin={isLogin}
          onTabChange={setIsLogin}
          onAuthSuccess={(u, t) => {
            setUser(u);
            setToken(t);
          }}
        />
      </main>
    </div>
  );
}
