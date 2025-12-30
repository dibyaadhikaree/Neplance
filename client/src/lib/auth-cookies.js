/**
 * Authentication utilities for cookie management
 * Client-side helpers for "use client" environment
 */

const COOKIE_OPTIONS = "path=/; secure; samesite=strict";
const EXPIRY_DAYS = 7;

// Helper to parse cookies into an object
const parseCookies = () =>
  Object.fromEntries(
    document.cookie
      .split("; ")
      .filter(Boolean)
      .map((c) => {
        const idx = c.indexOf("=");
        return [c.slice(0, idx), c.slice(idx + 1)];
      }),
  );

export function setAuthCookies(token, user) {
  const expires = new Date(
    Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  ).toUTCString();

  document.cookie = `auth_token=${token}; ${COOKIE_OPTIONS}; expires=${expires}`;
  document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(user))}; ${COOKIE_OPTIONS}; expires=${expires}`;
}

export function getAuthToken() {
  return parseCookies().auth_token || null;
}

export function getAuthUser() {
  const userCookie = parseCookies().auth_user;
  if (!userCookie) return null;

  try {
    return JSON.parse(decodeURIComponent(userCookie));
  } catch {
    return null;
  }
}

export function clearAuthCookies() {
  const expired = "Thu, 01 Jan 1970 00:00:00 UTC";
  document.cookie = `auth_token=; path=/; expires=${expired}`;
  document.cookie = `auth_user=; path=/; expires=${expired}`;
}

export const isAuthenticated = () => !!getAuthToken() && !!getAuthUser();
