import { NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/jobs", "/talent", "/profile", "/proposals"];

export function proxy(request) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get("refreshToken");

  if (!refreshToken) {
    const loginUrl = new URL("/", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/jobs/:path*",
    "/talent/:path*",
    "/profile/:path*",
    "/proposals/:path*",
  ],
};
