'use client'

import { clsxm } from '@/lib/helper'
import { FunctionComponent, ReactNode, SVGProps, useState, useRef } from 'react'
import { ThemeSwitcher } from './ThemeSwitcher'
import Link from 'next/link'

type Component<P = object> = FunctionComponent<{
  className?: string
} & {
  children?: ReactNode | undefined
} & P>

// Footer configuration
const footerConfig = {
  linkSections: [
    {
      name: 'About',
      links: [
        { name: 'Me', href: '/posts/aboutme_en', external: false },
        { name: '我', href: '/posts/aboutme', external: false },
      ],
    },
    {
      name: 'Socials',
      links: [
        { name: 'GitHub', href: 'https://github.com/yeungalan', external: true },
        { name: 'Twitter', href: 'https://twitter.com/yeungbluecat123', external: true },
      ],
    },
    {
      name: 'More',
      links: [
        { name: 'Friends', href: '/friends', external: false },
        { name: 'Projects', href: '/projects', external: false },
        { name: 'Status mointor', href: 'https://stats.uptimerobot.com/JKvyVhBqBO', external: true },
      ],
    },
  ],
  otherInfo: {
    date: '2016-{{now}}',
    icp: {
      text: 'Project Atlas: Global Infrastructure Modernization Initiative 2025',
      link: '#',
    },
  },
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Build date is injected at build time via next.config.ts. Format it with UTC
// fields so the server and client render an identical string (no hydration
// mismatch), and fall back to a fixed date if the value is ever unavailable.
const getRevisionDate = (): string => {
  const fallback = '2026 Jun 23'
  const iso = process.env.NEXT_PUBLIC_BUILD_DATE
  if (!iso) return fallback
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return fallback
  return `${d.getUTCFullYear()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`
}

const REVISION_DATE = getRevisionDate()

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
  return (
    <div className="space-x-0 space-y-3 md:space-x-6 md:space-y-0">
      {footerConfig.linkSections.map((section) => {
        return (
          <div
            className="flex items-center gap-4 md:inline-flex"
            key={section.name}
          >
            <b className="inline-flex items-center font-medium">
              {section.name}
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
                    {link.name}
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
  return <span className={className}>Powered by Vercel and Next.js.</span>
}

const FooterBottom = () => {
  const { otherInfo } = footerConfig
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
        <span>Alan Yeung & alanyeung.co and its affiliates</span>
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
          Rev. {REVISION_DATE} Production
        </span>
      </div>
      <div>
        <PoweredBy className="my-3 block md:my-0 md:inline" />
        {icp && (
          <>
            <Divider className="hidden md:inline" />
            <StyledLink href={icp.link} target="_blank" rel="noreferrer" external>
              {icp.text}
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

          <div className="mt-6 block text-center md:absolute md:bottom-0 md:right-0 md:mt-0">
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </footer>
  )
}
