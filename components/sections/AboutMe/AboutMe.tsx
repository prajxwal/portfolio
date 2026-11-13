'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './AboutMe.module.css';
import { createGooReveal } from '@/lib/animations/gooReveal';

gsap.registerPlugin(ScrollTrigger);

export default function AboutMe() {
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const headlineRef = useRef<HTMLHeadingElement>(null);
    const rightColRef = useRef<HTMLDivElement>(null);

    const marqueeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const isMobile = window.innerWidth <= 768;

        const ctx = gsap.context(() => {
            // Header animation
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

            // Header line grows in
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

            // Right column bio paragraphs
            const bios = rightColRef.current?.querySelectorAll('p');
            if (bios) {
                gsap.from(bios, {
                    opacity: 0,
                    y: isMobile ? 25 : 50,
                    stagger: isMobile ? 0.12 : 0.2,
                    duration: isMobile ? 0.6 : 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: rightColRef.current,
                        start: 'top 80%',
                        toggleActions: 'play reverse play reverse',
                    },
                });
            }



            // Marquee slide in
            gsap.from(marqueeRef.current, {
                opacity: 0,
                x: isMobile ? -40 : -100,
                duration: isMobile ? 0.7 : 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: marqueeRef.current,
                    start: 'top 90%',
                    toggleActions: 'play reverse play reverse',
                },
            });

        }, sectionRef);

        // Headline: gooey blur-to-sharp reveal, line by line
        const goo = createGooReveal(headlineRef.current?.querySelectorAll('span'), {
            trigger: headlineRef.current,
            start: 'top 80%',
        });

        return () => {
            ctx.revert();
            goo.destroy();
        };
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
                            I write code that occasionally works, build models that lose money in ways that would impress a statistician, and one day I'll found something that does all three and actually ships. The bar is low. I will clear it.
                        </p>
                        <p className={styles.bio}>
                            By day I'm debugging algorithms and pretending I understand quant finance. By night I'm getting choked unconscious by people who definitely don't know what a Sharpe ratio is. I lose a lot. I also show up the next day, which turns out to be most of the battle.
                        </p>
                        <p className={styles.bio}>
                            Most developers drink coffee to ship features. I drink it to remember my own name after sparring. The code still gets pushed. The models still run. The fight still happens. Badly sometimes, but it happens.
                        </p>
                        <p className={styles.bio}>
                            Currently breaking things in the gym, the markets, and production. My win rate across all three is a work in progress. It is, however, progressing.
                        </p>
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
                        <span>FOUNDER</span>
                        <span className={styles.marqueeDot}>●</span>
                        <span>DEVELOPER</span>
                        <span className={styles.marqueeDot}>●</span>
                        <span>DESIGNER</span>
                        <span className={styles.marqueeDot}>●</span>
                        <span>CREATOR</span>
                        <span className={styles.marqueeDot}>●</span>
                        <span>FOUNDER</span>
                        <span className={styles.marqueeDot}>●</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
