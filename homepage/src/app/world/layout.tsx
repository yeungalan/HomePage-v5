import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'World Map',
  description: 'An interactive map of the places around the world Alan Yeung has visited.',
  alternates: { canonical: '/world' },
  openGraph: {
    title: 'World Map',
    description: 'An interactive map of the places around the world Alan Yeung has visited.',
    url: '/world',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function WorldLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
