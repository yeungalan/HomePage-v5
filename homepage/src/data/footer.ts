/**
 * Footer link sections and metadata configuration.
 * URLs are derived from SITE_CONFIG and SOCIAL_LINKS so there is a single
 * source of truth for personal identifiers.
 */

import { SITE_CONFIG } from '@/constants/site';
import { SOCIAL_LINKS } from '@/data/social';

export interface FooterLinkItem {
  name: string;
  nameKey?: string;
  href: string;
  external: boolean;
}

export interface FooterLinkSection {
  name: string;
  nameKey: string;
  links: FooterLinkItem[];
}

export interface FooterOtherInfo {
  /** Copyright date range — `{{now}}` is replaced with the current year at render time. */
  date: string;
  icp?: {
    textKey: string;
    link: string;
  };
}

export interface FooterConfig {
  linkSections: FooterLinkSection[];
  otherInfo: FooterOtherInfo;
}

export const FOOTER_CONFIG: FooterConfig = {
  linkSections: [
    {
      name: 'About',
      nameKey: 'footer.sectionAbout',
      links: [
        { name: 'Me', href: '/posts/aboutme_en', external: false },
        { name: '我', href: '/posts/aboutme', external: false },
        { name: '自己紹介', href: '/posts/aboutme_ja', external: false },
      ],
    },
    {
      name: 'Socials',
      nameKey: 'footer.sectionSocials',
      links: [
        { name: 'GitHub', href: SITE_CONFIG.author.github, external: true },
        { name: 'Twitter', href: `https://twitter.com/${SOCIAL_LINKS.twitter}`, external: true },
      ],
    },
    {
      name: 'More',
      nameKey: 'footer.sectionMore',
      links: [
        { name: 'Friends', nameKey: 'footer.moreFriends', href: '/friends', external: false },
        { name: 'Projects', nameKey: 'footer.moreProjects', href: '/projects', external: false },
        {
          name: 'Status monitor',
          nameKey: 'footer.moreStatusMonitor',
          href: SITE_CONFIG.statusMonitorUrl,
          external: true,
        },
      ],
    },
  ],
  otherInfo: {
    date: `${SITE_CONFIG.foundedYear}-{{now}}`,
    icp: {
      textKey: 'footer.initiative',
      link: '#',
    },
  },
};
