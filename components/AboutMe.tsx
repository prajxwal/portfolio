'use client';

import { useEffect, useRef } from 'react';
import styles from './AboutMe.module.css';

export default function AboutMe() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(styles.inView);
                    } else {
                        entry.target.classList.remove(styles.inView);
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
        );

        const animatedElements = sectionRef.current?.querySelectorAll(`.${styles.scrollReveal}`);
        animatedElements?.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <section id="about" className={styles.about} ref={sectionRef}>
            <div className={styles.container}>
                {/* Section Header */}
                <div className={`${styles.header} ${styles.scrollReveal}`}>
                    <span className={styles.label}>ABOUT ME</span>
                    <div className={styles.headerLine}></div>
                    <span className={styles.index}>01</span>
                </div>

                {/* Main Content */}
                <div className={styles.content}>
                    {/* Left Column - Large Text */}
                    <div className={`${styles.leftColumn} ${styles.scrollReveal}`}>
                        <h2 className={styles.headline}>
                            <span className={styles.line}>I craft digital</span>
                            <span className={styles.line}>experiences that</span>
                            <span className={styles.lineHighlight}>make an impact.</span>
                        </h2>
                    </div>

                    {/* Right Column - Description */}
                    <div className={`${styles.rightColumn} ${styles.scrollReveal}`}>
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
                <div className={`${styles.skillsSection} ${styles.scrollReveal}`}>
                    <h3 className={styles.skillsTitle}>EXPERTISE</h3>
                    <div className={styles.skillsGrid}>
                        <div className={`${styles.skillCard} ${styles.scrollReveal}`} style={{ transitionDelay: '0s' }}>
                            <span className={styles.skillNumber}>01</span>
                            <h4 className={styles.skillName}>Frontend Development</h4>
                            <p className={styles.skillDesc}>React, Next.js, TypeScript, GSAP</p>
                        </div>
                        <div className={`${styles.skillCard} ${styles.scrollReveal}`} style={{ transitionDelay: '0.1s' }}>
                            <span className={styles.skillNumber}>02</span>
                            <h4 className={styles.skillName}>Backend Development</h4>
                            <p className={styles.skillDesc}>Node.js, Python, PostgreSQL, APIs</p>
                        </div>
                        <div className={`${styles.skillCard} ${styles.scrollReveal}`} style={{ transitionDelay: '0.2s' }}>
                            <span className={styles.skillNumber}>03</span>
                            <h4 className={styles.skillName}>Creative Design</h4>
                            <p className={styles.skillDesc}>UI/UX, Motion Design, Figma</p>
                        </div>
                        <div className={`${styles.skillCard} ${styles.scrollReveal}`} style={{ transitionDelay: '0.3s' }}>
                            <span className={styles.skillNumber}>04</span>
                            <h4 className={styles.skillName}>Problem Solving</h4>
                            <p className={styles.skillDesc}>Architecture, Optimization, Debugging</p>
                        </div>
                    </div>
                </div>

                {/* Marquee */}
                <div className={`${styles.marqueeWrapper} ${styles.scrollReveal}`}>
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
