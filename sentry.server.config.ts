import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Only enable in production
    enabled: process.env.NODE_ENV === "production",

    // Capture 10% of transactions for performance monitoring
    tracesSampleRate: 0.1,

    // Capture 100% of errors
    sampleRate: 1.0,

    // Set environment
    environment: process.env.NODE_ENV,

    // Don't send errors during development
    beforeSend(event) {
        if (process.env.NODE_ENV === "development") {
            console.error("[Sentry] Would send:", event.exception?.values?.[0]?.value);
            return null;
        }
        return event;
    },
});
