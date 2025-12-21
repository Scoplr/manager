import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Subdomain Routing:
 * - wrkspace.cc (main domain) → Marketing pages (/home, /blog, /privacy, /terms)
 * - app.wrkspace.cc (subdomain) → Dashboard/Application
 * - Login/Register work on both domains
 */

// Marketing paths that should stay on main domain
const marketingPaths = ["/home", "/blog", "/privacy", "/terms"];

// Auth paths that work on both domains
const authPaths = ["/login", "/register", "/api/auth", "/invite", "/setup"];

// Public routes that don't require authentication
const publicRoutes = ["/login", "/api/auth", "/home", "/invite", "/blog", "/privacy", "/terms", "/register"];

// Check if running in production with custom domains
const isProduction = process.env.NODE_ENV === "production";
const appDomain = process.env.NEXT_PUBLIC_APP_URL || "https://app.wrkspace.cc";
const marketingDomain = process.env.NEXT_PUBLIC_MARKETING_URL || "https://wrkspace.cc";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const host = request.headers.get("host") || "";

    // Detect if on app subdomain (app.wrkspace.cc or app.wrkspace.local for local testing)
    const isAppSubdomain = host.startsWith("app.");
    const isMainDomain = !isAppSubdomain && (host.includes("wrkspace.cc") || host.includes("wrkspace.local"));

    // Only apply subdomain routing in production or when using test domains
    const shouldApplySubdomainRouting = isProduction || host.includes("wrkspace");

    if (shouldApplySubdomainRouting) {
        // On main domain (wrkspace.cc), redirect dashboard routes to app subdomain
        if (isMainDomain && !authPaths.some(p => pathname.startsWith(p)) && !marketingPaths.some(p => pathname.startsWith(p))) {
            // This is a dashboard route on the main domain - redirect to app subdomain
            if (pathname !== "/" && !pathname.startsWith("/api")) {
                const redirectUrl = new URL(pathname, appDomain);
                redirectUrl.search = request.nextUrl.search;
                return NextResponse.redirect(redirectUrl);
            }
        }

        // On app subdomain (app.wrkspace.cc), redirect marketing routes to main domain
        if (isAppSubdomain && marketingPaths.some(p => pathname.startsWith(p))) {
            const redirectUrl = new URL(pathname, marketingDomain);
            redirectUrl.search = request.nextUrl.search;
            return NextResponse.redirect(redirectUrl);
        }
    }

    // Allow public routes without auth
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Check for session token
    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
    });

    // Redirect to login if not authenticated
    if (!token) {
        // Build callback URL - if on app subdomain, callback should stay there
        const callbackUrl = isAppSubdomain
            ? `${appDomain}${pathname}`
            : pathname;

        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", callbackUrl);
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
