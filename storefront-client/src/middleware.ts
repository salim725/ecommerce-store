import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/profile", "/orders", "/checkout"];
const authRoutes = ["/login", "/register"];
export function middleware(request: NextRequest) {
  const token = request.cookies.get("sf_token")?.value; // read token from cookies
  const { pathname } = request.nextUrl;

  // If trying to visit a protected page without being logged in → go to /login
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname); // remember where they were going
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in and trying to visit /login or /register → go home
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next(); // everything OK, continue normally
}

// Tell Next.js WHICH routes this middleware should run on
export const config = {
  matcher: [
    "/profile/:path*",
    "/orders/:path*",
    "/checkout/:path*",
    "/login",
    "/register",
  ],
};

//Middleware runs before a page loads — on the server edge.
//  It reads the cookie (not localStorage, because there's no browser yet)
//  and redirects before the user even sees the page.
