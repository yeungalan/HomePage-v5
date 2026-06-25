'use client'

import { clsxm } from '@/lib/helper'
import { FunctionComponent, ReactNode, SVGProps, useState, useRef } from 'react'
import { ThemeSwitcher } from './ThemeSwitcher'
import { LocaleSwitcher } from './LocaleSwitcher'
import { useTranslation } from '@/i18n'
import Link from 'next/link'
import { FOOTER_CONFIG } from '@/data/footer'
import { JST_OFFSET_MS } from '@/constants/timezones'
import { SITE_CONFIG } from '@/constants/site'

type Component<P = object> = FunctionComponent<{
  className?: string
} & {
  children?: ReactNode | undefined
} & P>

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Build date is injected at build time via next.config.ts as a UTC ISO string.
// Shift it to JST (UTC+9) and then read the UTC fields of the shifted value, so
// the server and client render an identical string (no hydration mismatch)
// regardless of the runtime's local timezone. Fall back to a fixed date if the
// value is ever unavailable.
const getRevisionDate = (): string => {
  const fallback = SITE_CONFIG.buildDateFallback
  const iso = process.env.NEXT_PUBLIC_BUILD_DATE
  if (!iso) return fallback
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return fallback
  const jst = new Date(d.getTime() + JST_OFFSET_MS)
  return `${jst.getUTCFullYear()} ${MONTHS[jst.getUTCMonth()]} ${jst.getUTCDate()}`
}

const REVISION_DATE = getRevisionDate()

// Deployment stage, bridged from the `STAGE` env var via next.config.ts. When it
// is `nonprod` or `dev`, the footer flags the build as non-production.
const STAGE = (process.env.NEXT_PUBLIC_STAGE ?? '').toLowerCase()
const IS_NON_PROD = STAGE === 'nonprod' || STAGE === 'dev'

export const FooterInfo = () => {
  return (
    <>
      <div className="relative text-white">
        <FooterLinkSection />
      </div>

      <FooterBottom />
    </>
  )
}

const FooterLinkSection = () => {
  const t = useTranslation()
  return (
    <div className="space-x-0 space-y-3 md:space-x-6 md:space-y-0">
      {FOOTER_CONFIG.linkSections.map((section) => {
        return (
          <div
            className="flex items-center gap-4 md:inline-flex"
            key={section.name}
          >
            <b className="inline-flex items-center font-medium">
              {t(section.nameKey)}
              <IonIosArrowDown className="ml-2 inline -rotate-90 select-none" />
            </b>

            <span className="space-x-4 text-neutral-content/90">
              {section.links.map((link) => {
                return (
                  <StyledLink
                    external={link.external}
                    className="link-hover link"
                    href={link.href}
                    key={link.name}
                  >
                    {link.nameKey ? t(link.nameKey) : link.name}
                  </StyledLink>
                )
              })}
            </span>
          </div>
        )
      })}
    </div>
  )
}

const StyledLink = (
  props: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    external?: boolean
  },
) => {
  const { external, children, ...rest } = props

  return (
    <Link
      href={rest.href ?? "#"}
      className="link-hover link"
      target={external ? "_blank" : rest.target}
      rel={external ? "noopener noreferrer" : undefined}
      {...rest}
    >
      {children}
    </Link>
  )
}

const Divider: Component = ({ className }) => {
  return (
    <span className={clsxm('select-none whitespace-pre opacity-50', className)}>
      {' '}
      |{' '}
    </span>
  )
}

const PoweredBy: Component = ({ className }) => {
  const t = useTranslation()
  return <span className={className}>{t('footer.poweredBy')}</span>
}

const FooterBottom = () => {
  const t = useTranslation()
  const { otherInfo } = FOOTER_CONFIG
  const currentYear = new Date().getFullYear().toString()
  const { date = currentYear, icp } = otherInfo || {}

  const [tapCount, setTapCount] = useState(0)
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleRevisionTap = () => {
    // Clear existing timeout
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current)
    }

    const newTapCount = tapCount + 1

    if (newTapCount >= 5) {
      // Toggle FPS monitor
      const currentState = localStorage.getItem('fps-monitor-enabled') === 'true'
      const newState = !currentState
      localStorage.setItem('fps-monitor-enabled', String(newState))

      // Dispatch custom event to notify StatComponent
      window.dispatchEvent(new CustomEvent('fps-monitor-toggle', { detail: { enabled: newState } }))

      // Show feedback
      alert(newState ? 'FPS Monitor Enabled! 🎮' : 'FPS Monitor Disabled')

      // Reset tap count
      setTapCount(0)
    } else {
      setTapCount(newTapCount)

      // Reset tap count after 2 seconds of no tapping
      tapTimeoutRef.current = setTimeout(() => {
        setTapCount(0)
      }, 2000)
    }
  }

  return (
    <div className="mt-12 space-y-3 text-center md:mt-6 md:text-left text-white">
      <div>
        <span>© {date.replace('{{now}}', currentYear)} </span>
        <span>{t('footer.copyright')}</span>
        <span>.</span>
        <span>
          <Divider className="inline" />
        </span>
        <span
          className="mt-3 block md:mt-0 md:inline cursor-pointer select-none hover:opacity-80 transition-opacity"
          onClick={handleRevisionTap}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleRevisionTap()
            }
          }}
        >
          Rev. {REVISION_DATE} {IS_NON_PROD ? t('footer.nonProduction') : t('footer.production')}
        </span>
      </div>
      <div>
        <PoweredBy className="my-3 block md:my-0 md:inline" />
        {icp && (
          <>
            <Divider className="hidden md:inline" />
            <StyledLink href={icp.link} target="_blank" rel="noreferrer" external>
              {t(icp.textKey)}
            </StyledLink>
          </>
        )}

        {icp ? (
          <Divider className="inline" />
        ) : (
          <Divider className="hidden md:inline" />
        )}
      </div>
    </div>
  )
}

export function IonIosArrowDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 512 512"
      {...props}
    >
      <path
        d="M256 294.1L383 167c9.4-9.4 24.6-9.4 33.9 0s9.3 24.6 0 34L273 345c-9.1 9.1-23.7 9.3-33.1.7L95 201.1c-4.7-4.7-7-10.9-7-17s2.3-12.3 7-17c9.4-9.4 24.6-9.4 33.9 0l127.1 127z"
        fill="currentColor"
      />
    </svg>
  )
}

// Export default
export const RealFooter = () => {
  return (
    <footer
      data-hide-print
      className="relative z-[1] mt-32 border-t border-x-uk-separator-opaque-light bg-stone-500 py-6 text-base-content/80 dark:border-uk-separator-opaque-dark dark:bg-black"
    >
      <div className="px-4 sm:px-8">
        <div className="relative mx-auto max-w-7xl lg:px-8">
          <FooterInfo />

          <div className="mt-6 flex items-center justify-center gap-3 md:absolute md:bottom-0 md:right-0 md:mt-0">
            <LocaleSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </footer>
  )
}
