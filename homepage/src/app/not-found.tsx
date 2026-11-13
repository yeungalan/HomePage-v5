import type { Metadata } from 'next'
import { RealFooter } from '@/components/FooterLinks'
import { NotFoundView } from '@/components/not-found/NotFoundView'

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist.',
  robots: { index: false, follow: true },
}

/**
 * The 404 page, shown for any URL that matches no route and wherever a page
 * calls notFound() (an unknown post or tag).
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col">
        <NotFoundView />
      </main>
      <RealFooter />
    </div>
  )
}
