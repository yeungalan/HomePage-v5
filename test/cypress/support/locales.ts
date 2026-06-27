/**
 * Expected, human-verified translations for each supported UI locale.
 *
 * These mirror the catalogues in `src/i18n/messages/*` but are intentionally
 * duplicated here: the test should fail loudly if a translation is accidentally
 * changed or removed, so it must not import the app's own message source.
 */
export interface LocaleExpectation {
  /** The locale code persisted in localStorage under the `locale` key. */
  code: string
  /** Short label rendered inside the footer language-switcher trigger. */
  shortLabel: string
  /** Full label rendered for this locale inside the switcher dropdown. */
  fullLabel: string
  /** A handful of strings that must be visible somewhere on the home page. */
  home: {
    navHome: string
    navWorld: string
    navGoals: string
    navPosts: string
    quickLinksTitle: string
  }
}

export const LOCALES: LocaleExpectation[] = [
  {
    code: 'en-US',
    shortLabel: 'EN',
    fullLabel: 'English',
    home: {
      navHome: 'Home',
      navWorld: 'Places I visited',
      navGoals: 'Goals',
      navPosts: 'Posts',
      quickLinksTitle: 'Quick links',
    },
  },
  {
    code: 'zh-HK',
    shortLabel: '繁',
    fullLabel: '繁體中文',
    home: {
      navHome: '首頁',
      navWorld: '我去過的地方',
      navGoals: '目標',
      navPosts: '文章',
      quickLinksTitle: '快速連結',
    },
  },
  {
    code: 'ja-JP',
    shortLabel: 'JA',
    fullLabel: '日本語',
    home: {
      navHome: 'ホーム',
      navWorld: '訪れた場所',
      navGoals: '目標',
      navPosts: '投稿',
      quickLinksTitle: 'クイックリンク',
    },
  },
]

/** Top-level routes that should render in every language. */
export const ROUTES = ['/', '/goals', '/posts', '/projects', '/friends', '/arch']
