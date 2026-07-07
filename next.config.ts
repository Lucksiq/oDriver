import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  silent: true,
  // No org/project set: uploading source maps requires a Sentry auth token,
  // which -- like the DSN -- only the user can generate from their own
  // Sentry account. Source map upload just no-ops without it; error capture
  // still works, stack traces just won't be de-minified in the Sentry UI
  // until that's configured.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
