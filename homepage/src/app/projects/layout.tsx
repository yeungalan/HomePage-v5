import type { Metadata } from 'next'
import type { PropsWithChildren } from 'react'

import { NormalContainer } from '@/components/NormalContainer'
import { RealFooter } from '@/components/FooterLinks'

export const metadata: Metadata = {
  title: 'Projects',
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