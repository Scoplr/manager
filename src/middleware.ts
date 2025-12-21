import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Path-Based Routing:
 * - wrkspace.cc/ → Marketing homepage
 * - wrkspace.cc/app/* → Dashboard (requires auth)
 * - wrkspace.cc/login, /register → Auth pages
 * - wrkspace.cc/blog, /privacy, /terms → Marketing pages
 */

// Public routes that don't require authentication
const publicRoutes = [
    "/login",
    "/register",
    "/api/auth",
    "/api/seed",
    "/home",
    "/invite",
    "/blog",
    "/privacy",
    "/terms",
    "/setup",
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes without auth
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Root path is public (redirects to /home)
    if (pathname === "/") {
        return NextResponse.next();
    }

    // Check for session token for protected routes (including /app/*)
    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
    });

    // Redirect to login if not authenticated
    if (!token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match all routes except static files, API auth routes, and public assets
        "/((?!_next/static|_next/image|favicon.ico|api/auth|manifest.json|icons/|sw.js).*)",
    ],
};
