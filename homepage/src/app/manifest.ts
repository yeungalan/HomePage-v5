import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/constants/site';

/**
 * The web app manifest (/manifest.webmanifest). It gives Android the icons to
 * use when the site is added to a home screen; scripts/generate-icons.mjs makes
 * them. `display: 'browser'` keeps that shortcut opening in a normal tab.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_CONFIG.title,
    short_name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    start_url: '/',
    display: 'browser',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
