'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FlowingMenu from '@/components/ui/FlowingMenu/FlowingMenu';
import { projects } from '@/lib/data/projects';
import styles from './Work.module.css';

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

            // Hero text animation
            const heroLines = heroRef.current?.querySelectorAll('span');
            if (heroLines) {
                gsap.from(heroLines, {
                    opacity: 0,
                    y: isMobile ? 30 : 60,
                    rotateX: isMobile ? 15 : 30,
                    stagger: isMobile ? 0.08 : 0.12,
                    duration: isMobile ? 0.7 : 1,
                    ease: 'power4.out',
                    scrollTrigger: {
                        trigger: heroRef.current,
                        start: 'top 80%',
                        toggleActions: 'play reverse play reverse',
                    },
                });
            }
        }, sectionRef);

        return () => ctx.revert();
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
