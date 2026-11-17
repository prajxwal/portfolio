'use client';

import { useCallback, useState } from 'react';
import { useSmoothScroll } from '@/lib/hooks/useSmoothScroll';
import Hero from '@/components/sections/Hero/Hero';
import AboutMe from '@/components/sections/AboutMe/AboutMe';
import Work from '@/components/sections/Work/Work';
import Contact from '@/components/sections/Contact/Contact';
import Preloader from '@/components/ui/Preloader/Preloader';

export default function Home() {
  // revealed: the loader collapsed and the hero starts; loaderMounted: the loader is still fading out on top
  const [revealed, setRevealed] = useState(false);
  const [loaderMounted, setLoaderMounted] = useState(true);
  const onReveal = useCallback(() => setRevealed(true), []);
  const onDone = useCallback(() => setLoaderMounted(false), []);

  useSmoothScroll(revealed);

  return (
    <main>
      {loaderMounted && <Preloader onReveal={onReveal} onDone={onDone} />}
      <Hero animateIn={revealed} />
      <AboutMe />
      <Work />
      <Contact />
    </main>
  );
}
