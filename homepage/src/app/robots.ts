import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/constants/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Internal test pages, API routes and the Markdown copies of pages (which
      // agents get at the pages' own URLs) should not be indexed.
      disallow: ['/testComponent/', '/api/', '/md/'],
    },
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
    host: SITE_CONFIG.url,
  };
}
