/**
 * Site-wide internationalization (i18n) configuration.
 *
 * This powers the UI-language switcher in the footer. It is intentionally a
 * lightweight, client-side system (mirroring how `next-themes` works in this
 * project) rather than URL/locale routing, so no page restructuring is needed.
 *
 * Note: this is distinct from the per-post language system used by the blog
 * (see `src/components/LanguageSwitcher.tsx`), which swaps Markdown documents.
 */

export const LOCALES = ['en-US', 'zh-HK', 'ja-JP'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en-US'

/** Key used to persist the user's explicit choice in localStorage. */
export const LOCALE_STORAGE_KEY = 'locale'

/** Human-readable labels shown in the language switcher (in their own script). */
export const LOCALE_LABELS: Record<Locale, string> = {
  'en-US': 'English',
  'zh-HK': '繁體中文',
  'ja-JP': '日本語',
}

/** Short label used in compact UI (e.g. the switcher trigger). */
export const LOCALE_SHORT_LABELS: Record<Locale, string> = {
  'en-US': 'EN',
  'zh-HK': '繁',
  'ja-JP': 'JA',
}

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value)

/**
 * Map an arbitrary BCP-47 language tag (e.g. `zh-Hant-HK`, `ja`, `en-GB`) onto
 * one of the supported locales. Returns `null` when there is no match so that
 * detection can fall through to the next candidate.
 */
export const normalizeLocale = (raw: string | undefined | null): Locale | null => {
  if (!raw) return null
  const lower = raw.toLowerCase()
  if (lower.startsWith('zh')) return 'zh-HK'
  if (lower.startsWith('ja')) return 'ja-JP'
  if (lower.startsWith('en')) return 'en-US'
  return null
}

/**
 * Pick the best supported locale from an ordered list of browser preferences
 * (`navigator.languages`). Falls back to {@link DEFAULT_LOCALE}.
 */
export const detectLocale = (
  preferences: readonly string[] | undefined,
): Locale => {
  if (preferences) {
    for (const pref of preferences) {
      const match = normalizeLocale(pref)
      if (match) return match
    }
  }
  return DEFAULT_LOCALE
}
