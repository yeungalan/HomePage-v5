'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, MotionConfig, type Variants } from 'motion/react'
import { Icon } from '@iconify/react'
import { useTranslation } from '@/i18n'
import { fadeInUpVariants, softBouncePreset } from '@/constants/motion'
import { useIsClient } from '@/hooks/use-is-client'
import { clsxm } from '@/lib/helper'
import { NotFoundLogo } from './NotFoundLogo'

/** Ways out of the 404 page besides "Back to home". */
const SUGGESTIONS = [
  { path: '/posts', titleKey: 'nav.posts', icon: 'mingcute:quill-pen-line' },
  { path: '/world', titleKey: 'nav.world', icon: 'mingcute:earth-line' },
  { path: '/goals', titleKey: 'nav.goals', icon: 'mingcute:target-line' },
  { path: '/projects', titleKey: 'nav.projects', icon: 'mingcute:flask-line' },
  { path: '/friends', titleKey: 'nav.friends', icon: 'mingcute:user-heart-line' },
  { path: '/arch', titleKey: 'nav.arch', icon: 'mingcute:sitemap-line' },
]

/** Brings in the lines under the logo one after another. */
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
}

const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-[#7b91c3] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black'

/** Percent-decoded, so a missing `/tags/日本` reads as typed. */
const decodePath = (path: string) => {
  try {
    return decodeURI(path)
  } catch {
    return path // malformed percent-encoding
  }
}

export function NotFoundView() {
  const t = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  // One pre-rendered page answers every unknown URL, so the address is only
  // known in the browser; showing it after mount keeps hydration clean.
  const isClient = useIsClient()
  const requested = isClient ? decodePath(pathname) : null

  // Opened in a fresh tab there is no page to go back to, so go home instead.
  const goBack = () => {
    if (window.history.length > 1) router.back()
    else router.push('/')
  }

  return (
    <MotionConfig reducedMotion="user">
      <section className="relative isolate flex flex-1 items-center justify-center overflow-hidden px-4 pb-12 pt-28 lg:pt-32">
        <Backdrop />

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex w-full max-w-3xl flex-col items-center text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={softBouncePreset}
            className="relative flex flex-col items-center"
            data-cy="not-found-logo"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 select-none bg-gradient-to-b from-neutral-900/[0.05] to-neutral-900/0 bg-clip-text text-[10rem] font-black leading-none tracking-tighter text-transparent sm:text-[15rem] dark:from-white/[0.08] dark:to-white/0"
            >
              404
            </span>
            <NotFoundLogo className="nf-float w-60 sm:w-80" />
            <span
              aria-hidden="true"
              className="nf-shadow -mt-1 h-3 w-36 rounded-[50%] bg-neutral-900/10 blur-[3px] sm:w-48 dark:bg-white/10"
            />
          </motion.div>

          <motion.p
            variants={fadeInUpVariants}
            className="mt-8 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-[#5b6fa6] dark:text-[#a9b8e2]"
          >
            {t('notFound.eyebrow')}
          </motion.p>
          <motion.h1
            variants={fadeInUpVariants}
            className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 [word-break:auto-phrase] sm:text-5xl dark:text-white"
          >
            {t('notFound.title')}
          </motion.h1>
          <motion.p
            variants={fadeInUpVariants}
            className="mt-4 max-w-md text-balance leading-relaxed text-neutral-600 [word-break:auto-phrase] dark:text-neutral-400"
          >
            {t('notFound.description')}
          </motion.p>

          {/* Fixed height, so nothing moves when the address appears. */}
          <motion.div variants={fadeInUpVariants} className="mt-5 flex h-8 w-full justify-center">
            {requested && (
              <code
                data-cy="not-found-path"
                className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border border-dashed sm:max-w-md border-neutral-300 bg-white/70 px-3.5 py-1.5 font-mono text-xs text-neutral-500 backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-400"
              >
                <Icon icon="mingcute:unlink-line" className="shrink-0 text-sm text-[#7b91c3]" aria-hidden="true" />
                <span className="sr-only">{t('notFound.requestedPath')}: </span>
                <span className="truncate">{requested}</span>
              </code>
            )}
          </motion.div>

          <motion.div variants={fadeInUpVariants} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              data-cy="not-found-home"
              className={clsxm(
                'inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-neutral-900/10 transition hover:-translate-y-0.5 hover:bg-neutral-700',
                'dark:bg-white dark:text-neutral-900 dark:shadow-none dark:hover:bg-neutral-200',
                FOCUS_RING,
              )}
            >
              <Icon icon="mingcute:home-4-line" className="text-base" aria-hidden="true" />
              {t('notFound.home')}
            </Link>
            <button
              type="button"
              onClick={goBack}
              data-cy="not-found-back"
              className={clsxm(
                'group inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/70 px-5 py-2.5 text-sm font-medium text-neutral-700 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-white',
                'dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-200 dark:hover:border-neutral-700 dark:hover:bg-neutral-900',
                FOCUS_RING,
              )}
            >
              <Icon
                icon="mingcute:arrow-left-line"
                className="text-base transition-transform group-hover:-translate-x-0.5"
                aria-hidden="true"
              />
              {t('notFound.back')}
            </button>
          </motion.div>

          <motion.nav
            variants={fadeInUpVariants}
            aria-labelledby="not-found-suggestions"
            className="mt-14 w-full"
          >
            <div className="flex items-center gap-4">
              <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-transparent to-neutral-200 dark:to-neutral-800" />
              <h2 id="not-found-suggestions" className="text-sm text-neutral-500 dark:text-neutral-400">
                {t('notFound.suggestions')}
              </h2>
              <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-l from-transparent to-neutral-200 dark:to-neutral-800" />
            </div>
            <ul className="mt-5 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={clsxm(
                      'inline-flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white/60 px-3.5 py-2 text-sm text-neutral-700 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-[#7b91c3]/60 hover:text-neutral-900 hover:shadow-md hover:shadow-[#7b91c3]/10',
                      'dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300 dark:hover:border-[#8ea3d8]/50 dark:hover:text-white',
                      FOCUS_RING,
                    )}
                  >
                    <Icon icon={item.icon} className="text-base text-[#7b91c3] dark:text-[#8ea3d8]" aria-hidden="true" />
                    {t(item.titleKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
        </motion.div>
      </section>
    </MotionConfig>
  )
}

/** Dot grid and two soft glows in the logo's periwinkle and blush. */
const Backdrop = () => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
    <div className="nf-grid absolute inset-0" />
    <div className="absolute left-1/2 top-[30%] size-72 -translate-x-[90%] -translate-y-1/2 rounded-full bg-[#7b91c3]/25 blur-3xl sm:size-96 dark:bg-[#7b91c3]/20" />
    <div className="absolute left-1/2 top-[34%] size-64 -translate-x-[10%] -translate-y-1/2 rounded-full bg-[#fddcda]/70 blur-3xl sm:size-80 dark:bg-[#f3aab6]/[0.13]" />
  </div>
)
