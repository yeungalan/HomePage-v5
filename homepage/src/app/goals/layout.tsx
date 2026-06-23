import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Goals',
  description: 'Personal and professional goals Alan Yeung is working towards.',
  alternates: { canonical: '/goals' },
  openGraph: {
    title: 'Goals',
    description: 'Personal and professional goals Alan Yeung is working towards.',
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
