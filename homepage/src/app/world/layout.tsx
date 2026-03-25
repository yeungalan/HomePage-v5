import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'World Map',
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function WorldLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
