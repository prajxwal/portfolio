'use client';

import { useState } from 'react';
import { useSmoothScroll } from '@/lib/hooks/useSmoothScroll';
import Hero from '@/components/sections/Hero/Hero';
import AboutMe from '@/components/sections/AboutMe/AboutMe';
import Work from '@/components/sections/Work/Work';
import Contact from '@/components/sections/Contact/Contact';
import Preloader from '@/components/ui/Preloader/Preloader';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useSmoothScroll(!isLoading);

  return (
    <main>
      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      <Hero animateIn={!isLoading} />
      <AboutMe />
      <Work />
      <Contact />
    </main>
  );
}
