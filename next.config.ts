import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Required for standalone output in Docker
  output: "standalone",
};

// Only wrap with Sentry if configured
const exportedConfig = process.env.SENTRY_ORG && process.env.SENTRY_PROJECT
  ? require("@sentry/nextjs").withSentryConfig(nextConfig, {
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    widenClientFileUpload: true,
    bundleSizeOptimizations: {
      excludeDebugStatements: true,
    },
    sourcemaps: {
      disable: process.env.NODE_ENV === "production",
    },
  })
  : nextConfig;

export default exportedConfig;

