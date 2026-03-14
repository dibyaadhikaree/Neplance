import { ACCESS_TOKEN_COOKIE, ACTIVE_ROLE_COOKIE } from "@/lib/api/config";

const getCookieValue = (name) => {
  if (typeof document === "undefined") {
    return null;
  }

  const encodedName = `${encodeURIComponent(name)}=`;
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(encodedName));

  return cookie ? decodeURIComponent(cookie.slice(encodedName.length)) : null;
};

export const normalizeRoleList = (role) =>
  Array.isArray(role) ? role : role ? [role] : [];

export const getStoredActiveRole = (roleList, fallback) => {
  const storedRole = getCookieValue(ACTIVE_ROLE_COOKIE);
  return roleList.includes(storedRole) ? storedRole : roleList[0] || fallback;
};

export const persistActiveRole = (role) => {
  if (typeof document !== "undefined" && role) {
    document.cookie = `${encodeURIComponent(ACTIVE_ROLE_COOKIE)}=${encodeURIComponent(role)}; Path=/; SameSite=Lax`;
  }
};

export const clearActiveRole = () => {
  if (typeof document !== "undefined") {
    document.cookie = `${encodeURIComponent(ACTIVE_ROLE_COOKIE)}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
};

export const getAccessToken = () => {
  return getCookieValue(ACCESS_TOKEN_COOKIE);
};

export const setAccessToken = (token) => {
  if (typeof document !== "undefined" && token) {
    document.cookie = `${encodeURIComponent(ACCESS_TOKEN_COOKIE)}=${encodeURIComponent(token)}; Path=/; SameSite=Lax`;
  }
};

export const clearAccessToken = () => {
  if (typeof document !== "undefined") {
    document.cookie = `${encodeURIComponent(ACCESS_TOKEN_COOKIE)}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
};
