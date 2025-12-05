"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthPanel, HeroSection } from "@/components";
import { getAuthToken, getAuthUser } from "@/lib/auth-cookies";

export default function Home() {
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();

  // Load session from cookies on mount
  useEffect(() => {
    const storedToken = getAuthToken();
    const storedUser = getAuthUser();

    if (storedToken && storedUser) {
      // Redirect to dashboard if already logged in
      router.push("/dashboard");
      return;
    }
    setIsHydrated(true);
  }, [router]);

  if (!isHydrated) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="container-centered bg-page font-sans">
      <main className="container-main section-gap">
        <HeroSection />
        <AuthPanel
          onAuthSuccess={() => {
            // Redirect to dashboard after successful auth
            router.push("/dashboard");
          }}
        />
      </main>
    </div>
  );
}
