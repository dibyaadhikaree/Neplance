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

export const getAccessToken = () => {
  if (typeof window !== "undefined") {
    return window.localStorage.getItem("neplance.accessToken");
  }
  return null;
};

export const setAccessToken = (token) => {
  if (typeof window !== "undefined" && token) {
    window.localStorage.setItem("neplance.accessToken", token);
  }
};

export const clearAccessToken = () => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("neplance.accessToken");
  }
};

export const logoutRequest = async () => {
  clearAccessToken();
  try {
    await apiCall("/api/auth/logout");
  } catch (_) {
    // Ignore logout errors and let callers handle navigation.
  }
};
