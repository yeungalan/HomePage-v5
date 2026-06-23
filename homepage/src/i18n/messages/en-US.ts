/**
 * English (en-US) message catalogue. This is the source of truth: its shape
 * defines the `Messages` type, and any key missing from another locale falls
 * back to the string defined here.
 *
 * Interpolation uses `{{name}}` placeholders, filled in by `t(key, vars)`.
 */
export const enUS = {
  nav: {
    home: 'Home',
    world: 'Places I visited',
    goals: 'Goals',
    posts: 'Posts',
    more: 'More',
    projects: 'Projects',
    friends: 'Friends Link',
    arch: 'Architecture',
  },
  footer: {
    quickLinksTitle: 'Quick links',
    quickLinksSubtitle: 'Want to go somewhere else?',
    linkPost: 'Post',
    linkFriends: 'Friends link',
    sectionAbout: 'About',
    sectionSocials: 'Socials',
    sectionMore: 'More',
    poweredBy: 'Powered by Vercel and Next.js.',
    language: 'Language',
  },
  hero: {
    tagline: 'Protecting What Matters Most, One Identity at a Time, with Love in AWS',
    changeSentence: 'Change a new sentence',
  },
  home: {
    awards: 'Awards and Certifications',
  },
  goals: {
    titleYear: '{{year}} Goals',
    daysLeft: '{{days}} days left until {{year}}',
    dayOfYear: 'Day of the Year',
    yearProgress: 'Year Progress',
    todayProgress: 'Today Progress',
    statusCompleted: 'Completed',
    statusInProgress: 'In progress',
    statusNotStarted: 'Not started',
  },
  projects: {
    title: 'Projects',
    subtitle: 'Project Links',
  },
  friends: {
    title: 'Friends',
    subtitle: 'Friend Links',
  },
  posts: {
    title: 'Posts',
    subtitle: 'Post Links',
  },
}

/**
 * Shape shared by every locale. Derived from {@link enUS} but with values
 * widened to `string` (no `as const`), so other catalogues can supply their
 * own translations while still being checked for completeness.
 */
export type Messages = typeof enUS
