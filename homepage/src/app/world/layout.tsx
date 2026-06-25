import type { Metadata, Viewport } from 'next'
import { SITE_CONFIG } from '@/constants/site'

export const metadata: Metadata = {
  title: 'World Map',
  description: `An interactive map of the places around the world ${SITE_CONFIG.author.name} has visited.`,
  alternates: { canonical: '/world' },
  openGraph: {
    title: 'World Map',
    description: `An interactive map of the places around the world ${SITE_CONFIG.author.name} has visited.`,
    url: '/world',
  },
}

/** Pure-black theme color for the immersive world-map dark background. */
const WORLD_THEME_COLOR = '#000000'

export const viewport: Viewport = {
  themeColor: WORLD_THEME_COLOR,
}

export default function WorldLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
