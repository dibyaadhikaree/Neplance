"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClientDashboard } from "@/components/dashboards/client/ClientDashboard";
import { FreelancerDashboard } from "@/components/dashboards/freelancer/FreelancerDashboard";
import {
  clearAuthCookies,
  getAuthToken,
  getAuthUser,
} from "@/lib/auth-cookies";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();

  // Load session from cookies on mount
  useEffect(() => {
    const storedToken = getAuthToken();
    const storedUser = getAuthUser();

    if (!storedToken || !storedUser) {
      // Redirect to home if not logged in
      router.push("/");
      return;
    }

    setToken(storedToken);
    setUser(storedUser);
    setIsHydrated(true);
  }, [router]);

  if (!isHydrated || !user || !token) {
    return null; // Prevent hydration mismatch and show nothing while redirecting
  }

  const handleLogout = () => {
    clearAuthCookies();
    setUser(null);
    setToken(null);
    router.push("/");
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
