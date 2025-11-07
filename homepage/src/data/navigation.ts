/**
 * Navigation configuration for header and footer
 */

import {
  IcTwotoneSignpost,
  FaSolidUserFriends,
  RMixPlanet,
} from '@/components/icons/menu-collection';

// Header Menu Types
export interface SubMenuItem {
  path: string;
  title: string;
  icon?: string;
}

export interface MenuItem {
  title: string;
  path: string;
  icon: string;
  subMenu?: SubMenuItem[];
  exclude?: string[];
}

// Footer Link Types
export interface FooterLink {
  title: string;
  path: string;
  icon: any; // React component type
}

/**
 * Main header menu configuration
 */
export const HEADER_MENU_CONFIG: MenuItem[] = [
  {
    title: 'Home',
    path: '/',
    icon: 'cbi:target',
  },
  {
    title: 'Places I visited',
    path: '/world',
    icon: 'mdi:world',
  },
  {
    title: 'Goals',
    path: '/goals',
    icon: 'mage:goals',
    exclude: ['/notes/topics'],
  },
  {
    title: 'Posts',
    path: '/posts',
    icon: 'mage:edit-pen',
    exclude: ['/posts'],
  },
  {
    title: 'More',
    icon: 'mingcute:settings-3-line',
    path: '#',
    subMenu: [
      { title: 'Projects', icon: 'mingcute:flask-line', path: '/projects' },
      { title: 'Friends Link', icon: 'mingcute:earth-line', path: '/friends' },
      { title: 'Architecture', icon: 'mdi:sitemap', path: '/arch' },
    ],
  },
];

/**
 * Footer quick links configuration
 */
export const FOOTER_LINKS: FooterLink[] = [
  {
    title: 'Post',
    path: '/posts',
    icon: IcTwotoneSignpost,
  },
  {
    title: 'Friends link',
    icon: FaSolidUserFriends,
    path: '/friends',
  },
  {
    title: 'arozos',
    icon: RMixPlanet,
    path: 'https://s01.aroz.alanyeung.co',
  },
];
