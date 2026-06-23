'use client'

import { tv } from 'tailwind-variants'
import { motion } from 'motion/react'

import { useIsClient } from '@/hooks/use-is-client'
import { LOCALES, LOCALE_LABELS, LOCALE_SHORT_LABELS, useI18n } from '@/i18n'

/**
 * Site-wide UI language switcher, rendered in the footer next to the theme
 * switcher. It mirrors {@link ThemeSwitcher}'s segmented-pill style (same size,
 * border colours and sliding active indicator) so the two controls sit together
 * consistently. Selecting a language persists the choice and overrides the
 * automatic browser-language detection on subsequent visits.
 */

// Matches the per-button styling in ThemeSwitcher.tsx.
const styles = tv({
  base: 'rounded-inherit inline-flex h-[32px] w-[32px] items-center justify-center border-0 text-xs font-medium text-current dark:text-white',
  variants: {
    status: {
      active: 'dark:text-black', // active button sits over the light indicator
    },
  },
  defaultVariants: {
    status: undefined,
  },
})

export const LocaleSwitcher = () => (
  <div className="relative inline-block">
    <LocaleIndicator />
    <LocaleButtonGroup />
  </div>
)

const LocaleIndicator = () => {
  const { locale, ready } = useI18n()
  const isClient = useIsClient()
  // Wait until the persisted/detected locale is resolved so the indicator
  // appears directly under the active language (no flash at the default).
  if (!isClient || !ready) return null

  const index = LOCALES.indexOf(locale)
  // Same geometry as ThemeSwitcher: 32px buttons with a 4px starting offset.
  const left = 4 + index * 32

  return (
    <motion.div
      className="absolute top-[4px] z-[-1] h-[32px] w-[32px] rounded-full bg-base-100 shadow-[0_1px_2px_0_rgba(127.5,127.5,127.5,.2),_0_1px_3px_0_rgba(127.5,127.5,127.5,.1)]"
      layout
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{ left }}
    />
  )
}

const LocaleButtonGroup = () => {
  const { locale, setLocale } = useI18n()

  return (
    <div className="inline-flex rounded-full border border-zinc-200 p-[3px] dark:border-white">
      {LOCALES.map((item) => (
        <button
          key={item}
          type="button"
          aria-label={LOCALE_LABELS[item]}
          aria-pressed={locale === item}
          title={LOCALE_LABELS[item]}
          className={styles({ status: locale === item ? 'active' : undefined })}
          onClick={() => setLocale(item)}
        >
          {LOCALE_SHORT_LABELS[item]}
        </button>
      ))}
    </div>
  )
}
