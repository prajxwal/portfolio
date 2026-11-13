'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FlowingMenu from '@/components/ui/FlowingMenu/FlowingMenu';
import { projects } from '@/lib/data/projects';
import styles from './Work.module.css';
import { createGooReveal } from '@/lib/animations/gooReveal';

gsap.registerPlugin(ScrollTrigger);

export default function Work() {
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const isMobile = window.innerWidth <= 768;

        const ctx = gsap.context(() => {
            gsap.from(headerRef.current, {
                opacity: 0,
                y: isMobile ? 20 : 40,
                duration: isMobile ? 0.7 : 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: headerRef.current,
                    start: 'top 85%',
                    toggleActions: 'play reverse play reverse',
                },
            });

            gsap.from(`.${styles.headerLine}`, {
                scaleX: 0,
                transformOrigin: 'left center',
                duration: isMobile ? 0.8 : 1.2,
                ease: 'power3.inOut',
                scrollTrigger: {
                    trigger: headerRef.current,
                    start: 'top 85%',
                    toggleActions: 'play reverse play reverse',
                },
            });

        }, sectionRef);

        // Headline: gooey blur-to-sharp reveal, line by line
        const goo = createGooReveal(heroRef.current?.querySelectorAll('h2 > span'), {
            trigger: heroRef.current,
            start: 'top 80%',
        });

        return () => {
            ctx.revert();
            goo.destroy();
        };
    }, []);

    return (
        <section id="work" className={styles.work} ref={sectionRef}>
            {/* Section Header */}
            <div className={styles.header} ref={headerRef}>
                <span className={styles.label}>SELECTED WORK</span>
                <div className={styles.headerLine}></div>
                <span className={styles.index}>02</span>
            </div>

            {/* Hero Text */}
            <div className={styles.heroText} ref={heroRef}>
                <h2 className={styles.headline}>
                    <span className={styles.headlineLine}>Projects</span>
                    <span className={styles.headlineItalic}>LIVE Below.</span>
                    <span className={styles.headlineItalic}> </span>
                </h2>
            </div>

            {/* Flowing Menu */}
            <div className={styles.menuContainer}>
                <FlowingMenu items={projects} speed={12} />
            </div>
        </section>
    );
}
