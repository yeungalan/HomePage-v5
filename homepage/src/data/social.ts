/**
 * Social media links and configuration
 */

export type SocialPlatform = 'github' | 'linkedin' | 'instagram' | 'twitter';

export interface SocialLink {
  type: SocialPlatform;
  id: string;
}

/**
 * Main social media accounts
 */
export const SOCIAL_LINKS: Record<SocialPlatform, string> = {
  github: 'yeungalan',
  linkedin: 'ho-yeung',
  instagram: 'ay.pixels',
  twitter: 'yeungbluecat123',
} as const;

/**
 * Get social links as an array of entries
 */
export const getSocialLinksArray = (): [SocialPlatform, string][] => {
  return Object.entries(SOCIAL_LINKS) as [SocialPlatform, string][];
};
