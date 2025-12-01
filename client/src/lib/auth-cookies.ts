/**
 * Authentication utilities for cookie management
 * These are client-side helpers since we're in a "use client" environment
 */

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string[];
}

export interface AuthCookies {
  token: string;
  user: User;
}

export function setAuthCookies(token: string, user: User) {
  // Set token cookie with security flags
  const expiresDate = new Date();
  expiresDate.setDate(expiresDate.getDate() + 7); // 7 days

  document.cookie = `auth_token=${token}; path=/; expires=${expiresDate.toUTCString()}; secure; samesite=strict`;
  
  // Store user data separately (can't store in httpOnly cookie)
  document.cookie = `auth_user=${JSON.stringify(user)}; path=/; expires=${expiresDate.toUTCString()}; secure; samesite=strict`;
}

/**
 * Get auth token from cookies
 */
export function getAuthToken(): string | null {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "auth_token") {
      return value || null;
    }
  }
  return null;
}

/**
 * Get user data from cookies
 */
export function getAuthUser(): User | null {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "auth_user") {
      try {
        return JSON.parse(decodeURIComponent(value));
      } catch (_e) {
        return null;
      }
    }
  }
  return null;
}

/**
 * Clear all auth cookies
 */
export function clearAuthCookies() {
  document.cookie = `auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
  document.cookie = `auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken() && !!getAuthUser();
}
