'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Icon } from '@iconify/react'

import { clsxm } from '@/lib/helper'
import { LOCALES, LOCALE_LABELS, LOCALE_SHORT_LABELS, useI18n } from '@/i18n'

/**
 * Site-wide UI language switcher, rendered in the footer next to the theme
 * switcher. A dropdown that opens upward (it lives at the bottom of the page).
 *
 * The trigger is sized to match {@link ThemeSwitcher} and shares its border
 * colours (border-zinc-200 in light mode, white in dark mode) so the two
 * controls look consistent side by side. The chosen language is persisted and
 * overrides the automatic browser-language detection on subsequent visits.
 */
export const LocaleSwitcher = () => {
  const { locale, setLocale, t } = useI18n()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside or pressing Escape.
  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('footer.language')}
        onClick={() => setOpen((prev) => !prev)}
        className={clsxm(
          // Match ThemeSwitcher: same 40px height, rounded-full, and border
          // colours (zinc-200 in light mode, white in dark mode).
          'inline-flex h-[40px] items-center gap-1.5 rounded-full border border-zinc-200 px-4',
          'text-xs font-medium text-current transition-colors duration-200 dark:border-white dark:text-white',
          'hover:bg-current/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current',
        )}
      >
        <Icon icon="mingcute:translate-2-line" className="text-base" />
        <span>{LOCALE_SHORT_LABELS[locale]}</span>
        <Icon
          icon="mingcute:down-line"
          className={clsxm('text-sm transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.7 }}
            className={clsxm(
              'absolute bottom-full right-0 z-10 mb-2 min-w-[9rem] overflow-hidden rounded-xl p-1',
              'border border-zinc-200/80 bg-white/95 shadow-lg backdrop-blur-md',
              'dark:border-zinc-700/80 dark:bg-zinc-900/95',
            )}
          >
            {LOCALES.map((item) => {
              const isActive = item === locale
              return (
                <li key={item} role="option" aria-selected={isActive}>
                  <button
                    type="button"
                    onClick={() => {
                      setLocale(item)
                      setOpen(false)
                    }}
                    className={clsxm(
                      'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm',
                      'transition-colors duration-150',
                      isActive
                        ? 'bg-blue-500/10 font-medium text-blue-600 dark:text-blue-400'
                        : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800',
                    )}
                  >
                    <span>{LOCALE_LABELS[item]}</span>
                    {isActive && <Icon icon="mingcute:check-line" className="text-base" />}
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
