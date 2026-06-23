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
    moreFriends: 'Friends',
    moreProjects: 'Projects',
    moreStatusMonitor: 'Status monitor',
    poweredBy: 'Powered by Vercel and Next.js.',
    copyright: 'Alan Yeung & alanyeung.co and its affiliates',
    initiative: 'Project Atlas: Global Infrastructure Modernization Initiative 2025',
    production: 'Production',
    nonProduction: 'Non Production',
    language: 'Language',
  },
  hero: {
    tagline: 'Protecting What Matters Most, One Identity at a Time, with Love in AWS',
    changeSentence: 'Change a new sentence',
  },
  home: {
    awards: 'Awards and Certifications',
    experience: 'Experience',
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
  arch: {
    title: 'Architecture',
    subtitle: 'Infrastructure Overview',
  },
  time: {
    justNow: 'Just now',
    secondAgo: '{{count}} second ago',
    secondsAgo: '{{count}} seconds ago',
    minuteAgo: '{{count}} minute ago',
    minutesAgo: '{{count}} minutes ago',
    hourAgo: '{{count}} hour ago',
    hoursAgo: '{{count}} hours ago',
    dayAgo: '{{count}} day ago',
    daysAgo: '{{count}} days ago',
    monthAgo: '{{count}} month ago',
    monthsAgo: '{{count}} months ago',
    yearAgo: '{{count}} year ago',
    yearsAgo: '{{count}} years ago',
  },
}

/**
 * Shape shared by every locale. Derived from {@link enUS} but with values
 * widened to `string` (no `as const`), so other catalogues can supply their
 * own translations while still being checked for completeness.
 */
export type Messages = typeof enUS
