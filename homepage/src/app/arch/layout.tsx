import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Architecture',
  description: 'An overview of the infrastructure and architecture behind alanyeung.co.',
  alternates: { canonical: '/arch' },
  openGraph: {
    title: 'Architecture',
    description: 'An overview of the infrastructure and architecture behind alanyeung.co.',
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
