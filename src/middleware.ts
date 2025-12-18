import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Production Rate Limiting Setup:
 * 
 * Install: npm install @upstash/ratelimit @upstash/redis
 * 
 * Add to this file:
 * ```
 * import { Ratelimit } from "@upstash/ratelimit";
 * import { Redis } from "@upstash/redis";
 * 
 * const ratelimit = new Ratelimit({
 *   redis: Redis.fromEnv(),
 *   limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
 *   analytics: true,
 * });
 * 
 * // In middleware, before auth check:
 * const ip = request.ip ?? "127.0.0.1";
 * const { success, limit, reset, remaining } = await ratelimit.limit(ip);
 * if (!success) {
 *   return new NextResponse("Too Many Requests", { status: 429 });
 * }
 * ```
 * 
 * Required env vars: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
 */

// Public routes that don't require authentication
const publicRoutes = ["/login", "/api/auth", "/home", "/invite"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
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
