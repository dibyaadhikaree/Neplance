"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useAuth } from "@/shared/context/AuthContext";

const normalizeRoleList = (role) =>
  Array.isArray(role) ? role : role ? [role] : [];

export const useAuthGate = ({ mode = "none", redirectTo } = {}) => {
  const router = useRouter();
  const auth = useAuth();
  const { user, activeRole, isHydrated } = auth;

  useEffect(() => {
    if (!isHydrated) return;

    if (mode === "require-auth" && !user) {
      router.push(redirectTo || "/");
      return;
    }

    if (mode === "redirect-authed" && user) {
      router.push(redirectTo || "/dashboard");
    }
  }, [isHydrated, user, mode, redirectTo, router]);

  const value = useMemo(() => {
    const roleList = normalizeRoleList(user?.role);
    const currentRole = activeRole || roleList[0] || "freelancer";

    return {
      ...auth,
      roleList,
      currentRole,
      isFreelancer: currentRole === "freelancer",
      isClient: currentRole === "client",
    };
  }, [auth, user, activeRole]);

  return value;
};
