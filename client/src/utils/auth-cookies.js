export function setAuthCookies(token, user) {
  console.warn("setAuthCookies is deprecated. Server handles cookies now.");
}

export function getAuthToken() {
  // Client cannot read HttpOnly cookies
  return null;
}

export function getAuthUser() {
  // User data should be fetched from context or API
  return null;
}

export function clearAuthCookies() {
  console.warn("clearAuthCookies is deprecated. Call /auth/logout API instead.");
}

export const isAuthenticated = () => false;
