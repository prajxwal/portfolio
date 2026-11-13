'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Contact.module.css';
import { createGooReveal } from '@/lib/animations/gooReveal';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const headlineRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);
    const infoRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);
    const ctaLinkRef = useRef<HTMLAnchorElement>(null);
    const ctaFollowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const isMobile = window.innerWidth <= 768;

        const ctx = gsap.context(() => {
            // Header slide in with line grow
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

            // CTA email link — slide from left with scale
            gsap.from(ctaRef.current, {
                opacity: 0,
                x: isMobile ? -30 : -80,
                duration: isMobile ? 0.7 : 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: ctaRef.current,
                    start: 'top 85%',
                    toggleActions: 'play reverse play reverse',
                },
            });

            // Info blocks stagger
            const infos = infoRef.current?.querySelectorAll(`.${styles.infoBlock}`);
            if (infos) {
                gsap.from(infos, {
                    opacity: 0,
                    y: isMobile ? 25 : 50,
                    scale: 0.95,
                    stagger: isMobile ? 0.1 : 0.15,
                    duration: isMobile ? 0.6 : 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: infoRef.current,
                        start: 'top 80%',
                        toggleActions: 'play reverse play reverse',
                    },
                });
            }

            // Footer line + content
            gsap.from(`.${styles.footerLine}`, {
                scaleX: 0,
                transformOrigin: 'left center',
                duration: isMobile ? 0.8 : 1.2,
                ease: 'power3.inOut',
                scrollTrigger: {
                    trigger: footerRef.current,
                    start: 'top 100%',
                    toggleActions: 'play reverse play reverse',
                },
            });

            gsap.from(`.${styles.footerContent}`, {
                opacity: 0,
                y: isMobile ? 10 : 20,
                duration: isMobile ? 0.6 : 0.8,
                delay: 0.3,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: footerRef.current,
                    start: 'top 100%',
                    toggleActions: 'play reverse play reverse',
                },
            });

        }, sectionRef);

        // Headline: gooey blur-to-sharp reveal, line by line
        const goo = createGooReveal(headlineRef.current?.querySelectorAll('h2 > span'), {
            trigger: headlineRef.current,
            start: 'top 80%',
        });

        return () => {
            ctx.revert();
            goo.destroy();
        };
    }, []);

    // CTA arrow follows the cursor while it's inside the card, then springs home
    useEffect(() => {
        const link = ctaLinkRef.current;
        const follow = ctaFollowRef.current;
        if (!link || !follow) return;

        const xTo = gsap.quickTo(follow, 'x', { duration: 0.6, ease: 'power3.out' });
        const yTo = gsap.quickTo(follow, 'y', { duration: 0.6, ease: 'power3.out' });

        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse') return;
            // Home centre = current rect minus the offset we've already applied
            const r = follow.getBoundingClientRect();
            const homeX = r.left + r.width / 2 - (gsap.getProperty(follow, 'x') as number);
            const homeY = r.top + r.height / 2 - (gsap.getProperty(follow, 'y') as number);
            xTo(e.clientX - homeX);
            yTo(e.clientY - homeY);
        };
        const onLeave = () => {
            xTo(0);
            yTo(0);
        };

        link.addEventListener('pointermove', onMove);
        link.addEventListener('pointerleave', onLeave);
        return () => {
            link.removeEventListener('pointermove', onMove);
            link.removeEventListener('pointerleave', onLeave);
            gsap.killTweensOf(follow);
        };
    }, []);

    return (
        <section id="contact" className={styles.contact} ref={sectionRef}>
            <div className={styles.container}>
                {/* Section Header */}
                <div className={styles.header} ref={headerRef}>
                    <span className={styles.label}>GET IN TOUCH</span>
                    <div className={styles.headerLine}></div>
                    <span className={styles.index}>03</span>
                </div>

                {/* Hero Text */}
                <div className={styles.heroText} ref={headlineRef}>
                    <h2 className={styles.headline}>
                        <span className={styles.headlineLine}>Let's create</span>
                        <span className={styles.headlineLine}><em>something</em> great</span>
                        <span className={styles.headlineLine}>together.</span>
                    </h2>
                </div>

                {/* CTA Row */}
                <div className={styles.ctaRow} ref={ctaRef}>
                    <a href="mailto:reachprajwal03@gmail.com" className={styles.ctaLink} ref={ctaLinkRef}>
                        <div className={styles.ctaContent}>
                            <span className={styles.ctaText}>reach out, I don&apos;t bite</span>
                            <span className={styles.ctaSub}>(in emails)</span>
                        </div>
                        <div className={styles.ctaFollow} ref={ctaFollowRef}>
                            <div className={styles.ctaButton}>
                                <span className={styles.ctaArrow}>↗</span>
                            </div>
                        </div>
                    </a>
                </div>

                {/* Info Grid */}
                <div className={styles.infoGrid} ref={infoRef}>
                    <div className={styles.infoBlock}>
                        <span className={styles.infoLabel}>LOCATION</span>
                        <p className={styles.infoValue}>India</p>
                    </div>
                    <div className={styles.infoBlock}>
                        <span className={styles.infoLabel}>SOCIALS</span>
                        <div className={styles.socialLinks}>
                            <a href="https://github.com/prajxwal" target="_blank" rel="noopener noreferrer">GitHub</a>
                            <a href="https://www.linkedin.com/in/prajwaljayaram/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                            <a href="https://www.youtube.com/@saladpy" target="_blank" rel="noopener noreferrer">YouTube</a>
                        </div>
                    </div>
                    <div className={styles.infoBlock}>
                        <span className={styles.infoLabel}>AVAILABILITY</span>
                        <p className={styles.infoValue}>
                            Open for freelance<br />& collaborations
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer} ref={footerRef}>
                    <div className={styles.footerLine}></div>
                    <div className={styles.footerContent}>
                        <span className={styles.footerText}>© 2026 Prajwal Jayaram</span>
                        <a href="#home" className={styles.backToTop}>
                            BACK TO TOP <span className={styles.backToTopArrow}>↑</span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
