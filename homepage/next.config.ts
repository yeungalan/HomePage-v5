import type { NextConfig } from "next";

/**
 * Requests whose Accept header lists `text/markdown`, as AI agents and other
 * tools send it. Browsers never do, so they keep getting HTML. The pattern only
 * checks that the type is listed; it doesn't weigh q-values.
 */
const ACCEPTS_MARKDOWN = [{ type: 'header' as const, key: 'accept', value: '(.*)text/markdown(.*)' }];

/**
 * Pages with a Markdown version. Each is served by the route handler at the
 * same path under /md (src/app/md/), built from the data the page renders.
 */
const MARKDOWN_PAGES = ['/', '/posts', '/posts/:slug', '/tags/:slug', '/projects', '/friends', '/goals', '/world', '/arch'];

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
    remotePatterns: [new URL("https://avatar.iran.liara.run/**")]
  },
  async rewrites() {
    return {
      // Checked before the filesystem, so the pre-rendered HTML doesn't answer first.
      beforeFiles: MARKDOWN_PAGES.map((source) => ({
        source,
        destination: source === '/' ? '/md' : `/md${source}`,
        has: ACCEPTS_MARKDOWN,
      })),
      // Checked only when nothing else matched: a Markdown 404 instead of the HTML one.
      fallback: [{ source: '/:path*', destination: '/md/not-found', has: ACCEPTS_MARKDOWN }],
    };
  },
};

export default nextConfig;
