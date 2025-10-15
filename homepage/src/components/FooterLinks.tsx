import { clsxm } from '@/lib/helper'
import { FunctionComponent, ReactNode, SVGProps } from 'react'

type Component<P = {}> = FunctionComponent<{
  className?: string
} & {
  children?: ReactNode | undefined
} & P>

// Footer configuration
const footerConfig = {
  linkSections: [
    {
      name: '关于',
      links: [
        { name: '关于本站', href: '/about', external: false },
        { name: '留言板', href: '/message', external: false },
      ],
    },
    {
      name: '社交',
      links: [
        { name: 'GitHub', href: 'https://github.com', external: true },
        { name: 'Twitter', href: 'https://twitter.com', external: true },
        { name: 'Telegram', href: 'https://t.me', external: true },
      ],
    },
    {
      name: '更多',
      links: [
        { name: '友链', href: '/friends', external: false },
        { name: '项目', href: '/projects', external: false },
        { name: '时间线', href: '/timeline', external: false },
      ],
    },
  ],
  otherInfo: {
    date: '2020-{{now}}',
    icp: {
      text: '粤ICP备xxxxxxxx号',
      link: 'https://beian.miit.gov.cn/',
    },
  },
}

export const FooterInfo = () => {
  return (
    <>
      <div className="relative">
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
    <a
      className="link-hover link"
      target={external ? '_blank' : props.target}
      rel={external ? 'noopener noreferrer' : undefined}
      {...rest}
    >
      {children}
    </a>
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
  return <span className={className}>Powered by Next.js.</span>
}

const FooterBottom = () => {
  const { otherInfo } = footerConfig
  const currentYear = new Date().getFullYear().toString()
  const { date = currentYear, icp } = otherInfo || {}

  return (
    <div className="mt-12 space-y-3 text-center md:mt-6 md:text-left">
      <div>
        <span>© {date.replace('{{now}}', currentYear)} </span>
        <a href="/">Alan Yeung & alanyeung.co and its affiliates</a>
        <span>.</span>
        <span>
          <Divider />
          <a href="/feed" target="_blank" rel="noreferrer">
            RSS
          </a>
          <Divider />
          <a href="/sitemap.xml" target="_blank" rel="noreferrer">
            Sitemap
          </a>
          <Divider className="inline" />
        </span>
        <span className="mt-3 block md:mt-0 md:inline">
          Stay hungry. Stay foolish.
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
      className="relative z-[1] mt-32 border-t border-x-uk-separator-opaque-light bg-stone-500 py-6 text-base-content/80 dark:border-uk-separator-opaque-dark"
    >
      <div className="px-4 sm:px-8">
        <div className="relative mx-auto max-w-7xl lg:px-8">
          <FooterInfo />

          <div className="mt-6 block text-center md:absolute md:bottom-0 md:right-0 md:mt-0">
            {/*<ThemeSwitcher />*/}
          </div>
        </div>
      </div>
    </footer>
  )
}