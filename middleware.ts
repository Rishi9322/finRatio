import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key-for-local-dev-only"
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value;

  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard");

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
    try {
      await jwtVerify(token, JWT_SECRET);
    } catch {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }

  if (isAuthRoute) {
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } catch {
        // invalid token, let them proceed to auth
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
