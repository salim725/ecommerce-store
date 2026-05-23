import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authRoutes = ["/login", "/verify-otp"];

export function proxy(request: NextRequest) {
  const token = request.cookies.get("crm_token")?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isProtected = !isAuthRoute && !pathname.startsWith("/_next");

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/products/:path*",
    "/orders/:path*",
    "/users/:path*",
    "/notifications/:path*",
    "/login",
    "/verify-otp",
  ],
};
