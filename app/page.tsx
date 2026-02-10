'use client';

import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import Hero from '@/components/Hero';
import AboutMe from '@/components/AboutMe';
import Work from '@/components/Work';
import Contact from '@/components/Contact';
import Preloader from '@/components/Preloader';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [isLoading]);

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

