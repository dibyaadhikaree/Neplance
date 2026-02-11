"use client";

import { ClientDashboard } from "@/features/dashboard/screens/ClientDashboard";
import { FreelancerDashboard } from "@/features/dashboard/screens/FreelancerDashboard";
import { useAuthGate } from "@/shared/hooks/useAuthGate";

export default function DashboardPage() {
  const { user, currentRole, isHydrated, logout, switchRole } = useAuthGate({
    mode: "require-auth",
  });

  if (!isHydrated || !user) return null;

  const isFreelancer = (currentRole || "freelancer") === "freelancer";

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
