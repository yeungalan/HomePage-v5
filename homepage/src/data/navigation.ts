/**
 * Navigation configuration for header and footer
 */

import type { ComponentType } from 'react';
import {
  IcTwotoneSignpost,
  FaSolidUserFriends,
  RMixPlanet,
} from '@/components/icons/menu-collection';

// Header Menu Types
export interface SubMenuItem {
  path: string;
  title: string;
  /** i18n key resolved at render time; falls back to `title` when absent. */
  titleKey?: string;
  icon?: string;
}

export interface MenuItem {
  title: string;
  /** i18n key resolved at render time; falls back to `title` when absent. */
  titleKey?: string;
  path: string;
  icon: string;
  subMenu?: SubMenuItem[];
  exclude?: string[];
}

// Footer Link Types
export interface FooterLink {
  title: string;
  /** i18n key resolved at render time; falls back to `title` when absent. */
  titleKey?: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
}

/**
 * Main header menu configuration
 */
export const HEADER_MENU_CONFIG: MenuItem[] = [
  {
    title: 'Home',
    titleKey: 'nav.home',
    path: '/',
    icon: 'cbi:target',
  },
  {
    title: 'Places I visited',
    titleKey: 'nav.world',
    path: '/world',
    icon: 'mdi:world',
  },
  {
    title: 'Goals',
    titleKey: 'nav.goals',
    path: '/goals',
    icon: 'mage:goals',
    exclude: ['/notes/topics'],
  },
  {
    title: 'Posts',
    titleKey: 'nav.posts',
    path: '/posts',
    icon: 'mage:edit-pen',
    exclude: ['/posts'],
  },
  {
    title: 'More',
    titleKey: 'nav.more',
    icon: 'mingcute:settings-3-line',
    path: '#',
    subMenu: [
      { title: 'Projects', titleKey: 'nav.projects', icon: 'mingcute:flask-line', path: '/projects' },
      { title: 'Friends Link', titleKey: 'nav.friends', icon: 'mingcute:earth-line', path: '/friends' },
      { title: 'Architecture', titleKey: 'nav.arch', icon: 'mdi:sitemap', path: '/arch' },
    ],
  },
];

/**
 * Footer quick links configuration
 */
export const FOOTER_LINKS: FooterLink[] = [
  {
    title: 'Post',
    titleKey: 'footer.linkPost',
    path: '/posts',
    icon: IcTwotoneSignpost,
  },
  {
    title: 'Friends link',
    titleKey: 'footer.linkFriends',
    icon: FaSolidUserFriends,
    path: '/friends',
  },
  {
    title: 'arozos',
    icon: RMixPlanet,
    path: 'https://s01.aroz.alanyeung.co',
  },
];
