import type { Metadata } from 'next'
import type { PropsWithChildren } from 'react'
import { SITE_CONFIG } from '@/constants/site'

import { NormalContainer } from '@/components/NormalContainer'
import { RealFooter } from '@/components/FooterLinks'

export const metadata: Metadata = {
  title: 'Projects',
  description: `Projects and things ${SITE_CONFIG.author.name} has built and worked on.`,
  alternates: { canonical: '/projects' },
  openGraph: {
    title: 'Projects',
    description: `Projects and things ${SITE_CONFIG.author.name} has built and worked on.`,
    url: '/projects',
  },
}

export default async function ProjectsLayout(props: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <NormalContainer>{props.children}</NormalContainer>
      </div>
      <RealFooter />
    </div>
  )
}
