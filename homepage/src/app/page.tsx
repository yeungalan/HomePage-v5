'use client';

import { HeroSection } from '@/components/home/HeroSection';
import { ActivitySection } from '@/components/home/ActivitySection';
import { Footer } from '@/components/Footer';
import { RealFooter } from '@/components/FooterLinks';

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <ActivitySection />
      <Footer />
      <RealFooter />
    </div>
  );
}
