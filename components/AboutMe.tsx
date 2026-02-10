'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './AboutMe.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function AboutMe() {
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const headlineRef = useRef<HTMLHeadingElement>(null);
    const rightColRef = useRef<HTMLDivElement>(null);
    const skillsRef = useRef<HTMLDivElement>(null);
    const marqueeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Header animation
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

            // Header line grows in
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

            // Headline lines stagger
            const lines = headlineRef.current?.querySelectorAll('span');
            if (lines) {
                gsap.from(lines, {
                    opacity: 0,
                    y: 80,
                    rotateX: 45,
                    stagger: 0.15,
                    duration: 1,
                    ease: 'power4.out',
                    scrollTrigger: {
                        trigger: headlineRef.current,
                        start: 'top 80%',
                        toggleActions: 'play reverse play reverse',
                    },
                });
            }

            // Right column bio paragraphs
            const bios = rightColRef.current?.querySelectorAll('p');
            if (bios) {
                gsap.from(bios, {
                    opacity: 0,
                    y: 50,
                    stagger: 0.2,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: rightColRef.current,
                        start: 'top 80%',
                        toggleActions: 'play reverse play reverse',
                    },
                });
            }

            // Skills title
            gsap.from(`.${styles.skillsTitle}`, {
                opacity: 0,
                x: -30,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: skillsRef.current,
                    start: 'top 80%',
                    toggleActions: 'play reverse play reverse',
                },
            });

            // Skill cards stagger with scale
            const cards = skillsRef.current?.querySelectorAll(`.${styles.skillCard}`);
            if (cards) {
                gsap.from(cards, {
                    opacity: 0,
                    y: 60,
                    scale: 0.9,
                    stagger: 0.12,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: skillsRef.current,
                        start: 'top 75%',
                        toggleActions: 'play reverse play reverse',
                    },
                });
            }

            // Marquee slide in
            gsap.from(marqueeRef.current, {
                opacity: 0,
                x: -100,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: marqueeRef.current,
                    start: 'top 90%',
                    toggleActions: 'play reverse play reverse',
                },
            });

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section id="about" className={styles.about} ref={sectionRef}>
            <div className={styles.container}>
                {/* Section Header */}
                <div className={styles.header} ref={headerRef}>
                    <span className={styles.label}>ABOUT ME</span>
                    <div className={styles.headerLine}></div>
                    <span className={styles.index}>01</span>
                </div>

                {/* Main Content */}
                <div className={styles.content}>
                    <div className={styles.leftColumn}>
                        <h2 className={styles.headline} ref={headlineRef}>
                            <span className={styles.line}>I craft digital</span>
                            <span className={styles.line}>experiences that</span>
                            <span className={styles.lineHighlight}>make an impact.</span>
                        </h2>
                    </div>

                    <div className={styles.rightColumn} ref={rightColRef}>
                        <p className={styles.bio}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                        </p>
                        <p className={styles.bio}>
                            Duis aute irure dolor in reprehenderit in voluptate velit esse
                            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                            cupidatat non proident, sunt in culpa qui officia deserunt.
                        </p>
                    </div>
                </div>

                {/* Skills Grid */}
                <div className={styles.skillsSection} ref={skillsRef}>
                    <h3 className={styles.skillsTitle}>EXPERTISE</h3>
                    <div className={styles.skillsGrid}>
                        <div className={styles.skillCard}>
                            <span className={styles.skillNumber}>01</span>
                            <h4 className={styles.skillName}>Frontend Development</h4>
                            <p className={styles.skillDesc}>React, Next.js, TypeScript, GSAP</p>
                        </div>
                        <div className={styles.skillCard}>
                            <span className={styles.skillNumber}>02</span>
                            <h4 className={styles.skillName}>Backend Development</h4>
                            <p className={styles.skillDesc}>Node.js, Python, PostgreSQL, APIs</p>
                        </div>
                        <div className={styles.skillCard}>
                            <span className={styles.skillNumber}>03</span>
                            <h4 className={styles.skillName}>Creative Design</h4>
                            <p className={styles.skillDesc}>UI/UX, Motion Design, Figma</p>
                        </div>
                        <div className={styles.skillCard}>
                            <span className={styles.skillNumber}>04</span>
                            <h4 className={styles.skillName}>Problem Solving</h4>
                            <p className={styles.skillDesc}>Architecture, Optimization, Debugging</p>
                        </div>
                    </div>
                </div>

                {/* Marquee */}
                <div className={styles.marqueeWrapper} ref={marqueeRef}>
                    <div className={styles.marquee}>
                        <span>DEVELOPER</span>
                        <span className={styles.marqueeDot}>●</span>
                        <span>DESIGNER</span>
                        <span className={styles.marqueeDot}>●</span>
                        <span>CREATOR</span>
                        <span className={styles.marqueeDot}>●</span>
                        <span>DEVELOPER</span>
                        <span className={styles.marqueeDot}>●</span>
                        <span>DESIGNER</span>
                        <span className={styles.marqueeDot}>●</span>
                        <span>CREATOR</span>
                        <span className={styles.marqueeDot}>●</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
