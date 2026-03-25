'use client'

import { useTheme } from 'next-themes'
import { flushSync } from 'react-dom'
import { tv } from 'tailwind-variants'
import { motion } from 'motion/react'

import { useIsClient } from '@/hooks/use-is-client'
import { transitionViewIfSupported } from '@/lib/dom'

const styles = tv({
  base: 'rounded-inherit inline-flex h-[32px] w-[32px] items-center justify-center border-0 text-current dark:text-white',
  variants: {
    status: {
      active: 'dark:text-black', // only active button gets black text in dark mode
    },
  },
  defaultVariants: {
    status: undefined,
  },
})

const iconClassNames = 'h-4 w-4 text-current'

const SunIcon = () => (
  <svg
    className={iconClassNames}
    fill="none"
    height="24"
    shapeRendering="geometricPrecision"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width="24"
  >
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2" />
    <path d="M12 21v2" />
    <path d="M4.22 4.22l1.42 1.42" />
    <path d="M18.36 18.36l1.42 1.42" />
    <path d="M1 12h2" />
    <path d="M21 12h2" />
    <path d="M4.22 19.78l1.42-1.42" />
    <path d="M18.36 5.64l1.42-1.42" />
  </svg>
)

const SystemIcon = () => (
  <svg
    className={iconClassNames}
    fill="none"
    height="24"
    shapeRendering="geometricPrecision"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width="24"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <path d="M8 21h8" />
    <path d="M12 17v4" />
  </svg>
)

const DarkIcon = () => (
  <svg
    fill="none"
    height="24"
    shapeRendering="geometricPrecision"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width="24"
    className={iconClassNames}
  >
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
)

export const ThemeSwitcher = () => (
  <div className="relative inline-block">
    <ThemeIndicator />
    <ButtonGroup />
  </div>
)

const ThemeIndicator = () => {
  const { theme } = useTheme()
  const isClient = useIsClient()
  if (!isClient || !theme) return null

  const leftMap: Record<string, number> = { light: 4, system: 36, dark: 68 }

  return (
    <motion.div
      className="absolute top-[4px] z-[-1] h-[32px] w-[32px] rounded-full bg-base-100 shadow-[0_1px_2px_0_rgba(127.5,127.5,127.5,.2),_0_1px_3px_0_rgba(127.5,127.5,127.5,.1)]"
      layout
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{ left: leftMap[theme] }}
    />
  )
}

const ButtonGroup = () => {
  const { theme, setTheme } = useTheme()

  const buildThemeTransition = (newTheme: 'light' | 'dark' | 'system') => {
    transitionViewIfSupported(() => {
      flushSync(() => setTheme(newTheme))
    })
  }

  return (
    <div className="inline-flex rounded-full border border-zinc-200 p-[3px] dark:border-white">
      <button
        aria-label="Switch to light theme"
        type="button"
        className={styles({ status: theme === 'light' ? 'active' : undefined })}
        onClick={() => buildThemeTransition('light')}
      >
        <SunIcon />
      </button>
      <button
        aria-label="Switch to system theme"
        type="button"
        className={styles({ status: theme === 'system' ? 'active' : undefined })}
        onClick={() => buildThemeTransition('system')}
      >
        <SystemIcon />
      </button>
      <button
        aria-label="Switch to dark theme"
        type="button"
        className={styles({ status: theme === 'dark' ? 'active' : undefined })}
        onClick={() => buildThemeTransition('dark')}
      >
        <DarkIcon />
      </button>
    </div>
  )
}
