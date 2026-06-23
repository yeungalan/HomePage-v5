import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    // Captured when `next build` (or `next dev`) runs, so the footer can show
    // the last build date. Inlined into the bundle for client components.
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString(),
    // Deployment stage (read from the `STAGE` env var), exposed to client
    // components so the footer can flag non-production builds. Empty when unset.
    NEXT_PUBLIC_STAGE: process.env.STAGE ?? '',
  },
  images: {
    remotePatterns: [
      new URL("https://avatar.iran.liara.run/**"),
      // Blog post photos are hosted on this S3 bucket; whitelist it so the
      // Next.js Image Optimization API can serve resized/modern formats.
      new URL("https://s3.alanyeung.co/**"),
    ]
  },
};

export default nextConfig;
