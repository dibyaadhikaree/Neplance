"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClientDashboard } from "@/components/dashboards/client/ClientDashboard";
import { FreelancerDashboard } from "@/components/dashboards/freelancer/FreelancerDashboard";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();

  // Load session from server on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { apiCall } = await import("@/services/api");
        const data = await apiCall("/auth/me");
        if (data.data?.user) {
          setUser(data.data.user);
          setIsHydrated(true);
        } else {
          router.push("/");
        }
      } catch (error) {
        router.push("/");
      }
    };
    fetchUser();
  }, [router]);

  if (!isHydrated || !user) {
    return null; // Prevent hydration mismatch and show nothing while redirecting
  }

  const handleLogout = async () => {
    try {
      const { apiCall } = await import("@/services/api");
      await apiCall("/auth/logout");
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
      // Force redirect anyway
      router.push("/");
    }
  };

  const handleRoleSwitch = (updatedUser) => {
    // Update the user state with the new role
    setUser(updatedUser);
  };

  // Check user role and render appropriate dashboard
  // Use the first role in the array as the current role
  const isFreelancer = user.role?.[0] === "freelancer";

  return isFreelancer ? (
    <FreelancerDashboard
      user={user}
      onLogout={handleLogout}
      onRoleSwitch={handleRoleSwitch}
    />
  ) : (
    <ClientDashboard
      user={user}
      onLogout={handleLogout}
      onRoleSwitch={handleRoleSwitch}
    />
  );
}
