import type { Metadata } from 'next'
import type { PropsWithChildren } from 'react'

import { NormalContainer } from '@/components/NormalContainer'
import { RealFooter } from '@/components/FooterLinks'

export const metadata: Metadata = {
  title: 'Friends',
  description: "Friends' links and sites worth visiting, curated by Alan Yeung.",
  alternates: { canonical: '/friends' },
  openGraph: {
    title: 'Friends',
    description: "Friends' links and sites worth visiting, curated by Alan Yeung.",
    url: '/friends',
  },
}

export default async function FriendsLayout(props: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <NormalContainer>{props.children}</NormalContainer>
      </div>
      <RealFooter />
    </div>
  )
}