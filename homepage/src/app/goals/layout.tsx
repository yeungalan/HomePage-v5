import type { Metadata } from 'next'
import { SITE_CONFIG } from '@/constants/site'

export const metadata: Metadata = {
  title: 'Goals',
  description: `Personal and professional goals ${SITE_CONFIG.author.name} is working towards.`,
  alternates: { canonical: '/goals' },
  openGraph: {
    title: 'Goals',
    description: `Personal and professional goals ${SITE_CONFIG.author.name} is working towards.`,
    url: '/goals',
  },
}

export default function GoalsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
