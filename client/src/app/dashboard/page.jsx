"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ClientDashboard } from "@/features/dashboard/screens/ClientDashboard";
import { FreelancerDashboard } from "@/features/dashboard/screens/FreelancerDashboard";
import { useAuth } from "@/shared/context/AuthContext";

export default function DashboardPage() {
  const { user, activeRole, isHydrated, logout, switchRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !user) {
      router.push("/");
    }
  }, [isHydrated, user, router]);

  if (!isHydrated || !user) return null;

  const isFreelancer = (activeRole || user?.role?.[0] || "freelancer") === "freelancer";

  const sharedProps = {
    user,
    onLogout: logout,
    onRoleSwitch: switchRole,
  };

  return isFreelancer ? (
    <FreelancerDashboard {...sharedProps} />
  ) : (
    <ClientDashboard {...sharedProps} />
  );
}
