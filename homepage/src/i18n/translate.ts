/**
 * Message lookup shared by the client-side `t()` (see `context.tsx`) and server
 * code that renders text outside React, such as the Markdown versions of pages
 * served to agents (`src/lib/markdown/`). Unlike `context.tsx`, it is safe to
 * import from server modules.
 */

import { DEFAULT_LOCALE, type Locale } from './config'
import { MESSAGES } from './messages'

export type TranslateVars = Record<string, string | number>

/** Translate function shape, as returned by `useTranslation()`. */
export type TranslateFn = (key: string, vars?: TranslateVars) => string

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

const interpolate = (template: string, vars?: TranslateVars): string => {
  if (!vars) return template
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  )
}

/**
 * Translate a dot-path key (e.g. `nav.home`) into `locale`, falling back to the
 * default (English) catalogue and then to the key itself.
 */
export const translate = (locale: Locale, key: string, vars?: TranslateVars): string => {
  const template =
    lookup(MESSAGES[locale], key) ??
    lookup(MESSAGES[DEFAULT_LOCALE], key) ??
    key
  return interpolate(template, vars)
}
