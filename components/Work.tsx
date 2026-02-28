'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FlowingMenu from './FlowingMenu';
import styles from './Work.module.css';

gsap.registerPlugin(ScrollTrigger);

const projects = [
    {
        link: 'https://github.com/prajxwal/hearMD',
        text: 'hearMD',
        image: 'https://picsum.photos/seed/hearmd/600/400',
        category: 'Full Stack',
        year: '2026',
    },
    {
        link: 'https://option-pricing-engine.vercel.app/',
        text: 'Option Pricing Engine',
        image: 'https://picsum.photos/seed/optionprice/600/400',
        category: 'Quant Finance',
        year: '2025',
    },
    {
        link: 'https://wfc-sudoku-solver.vercel.app/',
        text: 'WFC Sudoku Solver',
        image: 'https://picsum.photos/seed/sudoku/600/400',
        category: 'Algorithms',
        year: '2025',
    },
    {
        link: 'https://github.com/prajxwal/WindowsDefenderBypass-csharp',
        text: 'Defender Bypass',
        image: 'https://picsum.photos/seed/defender/600/400',
        category: 'Security',
        year: '2024',
    },
];

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
