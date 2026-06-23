/**
 * Centralized site configuration used for SEO metadata, sitemap, robots,
 * structured data and Open Graph / Twitter cards.
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
  author: {
    name: 'Alan Yeung',
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
