/**
 * Centralized site configuration used for SEO metadata, sitemap, robots,
 * structured data, Open Graph / Twitter cards, analytics, and footer.
 */

export const SITE_CONFIG = {
  /** Canonical origin of the site (no trailing slash). */
  url: 'https://alanyeung.co',
  /** Used for <title> templates and Open Graph `siteName`. */
  name: 'Alan Yeung',
  title: 'Alan Yeung @ Tokyo, JP',
  description:
    'Personal homepage of Alan Yeung — cloud security engineer based in Tokyo, Japan. Posts on life in Japan, projects, goals and the places I have visited.',
  /** Default Open Graph / Twitter share image (relative to `url`). */
  ogImage: '/assets/images/profilePic.png',
  locale: 'en_US',
  /** BCP-47 language tag for the HTML `lang` attribute. */
  defaultLang: 'en',
  /** The year the site was first published — used in the footer copyright range. */
  foundedYear: 2016,
  /** Google Analytics measurement ID. */
  googleAnalyticsId: 'G-5W3MDW6YSY',
  /** Uptime / status-monitor public dashboard URL. */
  statusMonitorUrl: 'https://stats.uptimerobot.com/JKvyVhBqBO',
  /**
   * Fallback revision date shown in the footer when `NEXT_PUBLIC_BUILD_DATE`
   * is unavailable (e.g. in local dev without a build step).
   */
  buildDateFallback: '2026 Jun 22',
  author: {
    name: 'Alan Yeung',
    jobTitle: 'Cloud Security Engineer',
    twitter: '@yeungbluecat123',
    github: 'https://github.com/yeungalan',
    linkedin: 'https://www.linkedin.com/in/ho-yeung',
  },
  keywords: [
    'Alan Yeung',
    'alanyeung.co',
    'Tokyo',
    'Japan',
    'cloud security',
    'AWS',
    'software engineer',
    'personal blog',
    'living in Japan',
  ],
} as const;
