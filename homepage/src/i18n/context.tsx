'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  detectLocale,
  isLocale,
  type Locale,
} from './config'
import { MESSAGES } from './messages'

type Vars = Record<string, string | number>

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  /** Translate a dot-path key (e.g. `nav.home`) with optional interpolation. */
  t: (key: string, vars?: Vars) => string
  /** True once the persisted/detected locale has been resolved on the client. */
  ready: boolean
}

const I18nContext = createContext<I18nContextValue | null>(null)

/** Resolve a dot-path (`a.b.c`) against a nested message object. */
const lookup = (messages: unknown, key: string): string | undefined => {
  const value = key
    .split('.')
    .reduce<unknown>((acc, part) =>
      acc && typeof acc === 'object'
        ? (acc as Record<string, unknown>)[part]
        : undefined,
    messages)
  return typeof value === 'string' ? value : undefined
}

const interpolate = (template: string, vars?: Vars): string => {
  if (!vars) return template
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  )
}

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  // Start from the default locale so the server-rendered markup and the first
  // client render agree (avoids hydration mismatches). The real preference is
  // applied in the effect below, after mount.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let next: Locale | null = null

    try {
      const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
      if (isLocale(stored)) next = stored
    } catch {
      // Access to localStorage can throw (private mode / blocked cookies).
    }

    // No explicit choice yet: auto-detect from the browser preferences.
    if (!next) next = detectLocale(navigator.languages ?? [navigator.language])

    setLocaleState(next)
    setReady(true)
  }, [])

  // Keep the document language in sync for accessibility and SEO.
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next)
    } catch {
      // Ignore persistence failures; the in-memory choice still applies.
    }
  }, [])

  const t = useCallback(
    (key: string, vars?: Vars): string => {
      const template =
        lookup(MESSAGES[locale], key) ??
        lookup(MESSAGES[DEFAULT_LOCALE], key) ??
        key
      return interpolate(template, vars)
    },
    [locale],
  )

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t, ready }),
    [locale, setLocale, t, ready],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = (): I18nContextValue => {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within an <I18nProvider>')
  }
  return ctx
}

/** Convenience hook returning just the translate function. */
export const useTranslation = () => useI18n().t
