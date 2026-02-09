"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthPanel } from "@/features/auth/components/AuthPanel";
import { HeroSection } from "@/shared/brand/HeroSection";

export default function Home() {
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();

  // Load session from server on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { apiCall } = await import("@/services/api");
        const data = await apiCall("/auth/me");
        if (data.status === "success" && data.data.user) {
          router.push("/dashboard");
        } else {
          setIsHydrated(true);
        }
      } catch (_error) {
        // Not logged in or error
        setIsHydrated(true);
      }
    };
    checkSession();
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
