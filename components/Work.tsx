'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FlowingMenu from './FlowingMenu';
import styles from './Work.module.css';

gsap.registerPlugin(ScrollTrigger);

const projects = [
    {
        link: '#',
        text: 'Project Alpha',
        image: 'https://picsum.photos/seed/alpha/600/400',
        category: 'Web Development',
        year: '2025',
    },
    {
        link: '#',
        text: 'Project Beta',
        image: 'https://picsum.photos/seed/beta/600/400',
        category: 'UI/UX Design',
        year: '2025',
    },
    {
        link: '#',
        text: 'Project Gamma',
        image: 'https://picsum.photos/seed/gamma/600/400',
        category: 'Full Stack',
        year: '2024',
    },
    {
        link: '#',
        text: 'Project Delta',
        image: 'https://picsum.photos/seed/delta/600/400',
        category: 'Creative Dev',
        year: '2024',
    },
];

export default function Work() {
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(headerRef.current, {
                opacity: 0,
                y: 40,
                duration: 1,
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
                duration: 1.2,
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
                    y: 60,
                    rotateX: 30,
                    stagger: 0.12,
                    duration: 1,
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
                    <span className={styles.headlineLine}>Projects that push</span>
                    <span className={styles.headlineLine}>boundaries & break</span>
                    <span className={styles.headlineItalic}>the ordinary.</span>
                </h2>
            </div>

            {/* Flowing Menu */}
            <div className={styles.menuContainer}>
                <FlowingMenu items={projects} speed={12} />
            </div>
        </section>
    );
}
