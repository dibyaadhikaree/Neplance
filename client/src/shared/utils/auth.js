import { apiCall } from "@/services/api";

export const normalizeRoleList = (role) =>
  Array.isArray(role) ? role : role ? [role] : [];

export const getStoredActiveRole = (roleList, fallback) => {
  const storedRole =
    typeof window !== "undefined"
      ? window.localStorage.getItem("neplance.activeRole")
      : null;
  return roleList.includes(storedRole) ? storedRole : roleList[0] || fallback;
};

export const persistActiveRole = (role) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("neplance.activeRole", role);
  }
};

export const logoutRequest = async () => {
  try {
    await apiCall("/auth/logout");
  } catch (_) {
    // Ignore logout errors and let callers handle navigation.
  }
};
