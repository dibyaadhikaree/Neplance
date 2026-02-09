import { NextResponse } from "next/server";

/**
 * Middleware for authentication and protected routes
 * - Validates auth tokens from cookies
 * - Protects routes that require authentication
 * - Redirects unauthenticated users to login
 */

export function proxy(request) {
  const pathname = request.nextUrl.pathname;

  // Get auth token from cookies
  const authToken = request.cookies.get("jwt")?.value;

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/profile", "/settings"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Public auth routes (redirect to home if already logged in)
  const authRoutes = ["/login", "/signup"];
  const isAuthRoute = authRoutes.some((route) => pathname === route);

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL("/", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in and trying to access auth pages, redirect to home
  if (isAuthRoute && authToken) {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  // Continue to next middleware or route handler
  const response = NextResponse.next();

  // Add security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}

export const config = {
  // Apply middleware to these paths
  matcher: [
    // Protect dashboard routes
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};
