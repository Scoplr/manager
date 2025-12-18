import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default withSentryConfig(nextConfig, {
  // Suppresses source map uploading logs during build
  silent: true,

  // Use environment variable for org/project
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Upload source maps for better stack traces
  widenClientFileUpload: true,

  // Tree-shake debug logging and reduce bundle size
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
  },

  // Configure source maps
  sourcemaps: {
    disable: process.env.NODE_ENV === "production",
  },
});
