import type { Metadata } from 'next'
import { SITE_CONFIG } from '@/constants/site'

export const metadata: Metadata = {
  title: 'Architecture',
  description: `An overview of the infrastructure and architecture behind ${new URL(SITE_CONFIG.url).hostname}.`,
  alternates: { canonical: '/arch' },
  openGraph: {
    title: 'Architecture',
    description: `An overview of the infrastructure and architecture behind ${new URL(SITE_CONFIG.url).hostname}.`,
    url: '/arch',
  },
}

export default function ArchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
