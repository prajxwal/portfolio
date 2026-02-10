'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Contact.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const headlineRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);
    const infoRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Header slide in with line grow
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

            // Headline — each word/line animates with clip and translate
            const headlineEl = headlineRef.current?.querySelector('h2');
            if (headlineEl) {
                // Split into lines manually via children
                const lines = headlineEl.querySelectorAll('span, br');
                const animateTargets = headlineEl.querySelectorAll('span');

                gsap.from(animateTargets, {
                    opacity: 0,
                    y: 100,
                    rotateX: 40,
                    stagger: 0.12,
                    duration: 1.2,
                    ease: 'power4.out',
                    scrollTrigger: {
                        trigger: headlineRef.current,
                        start: 'top 80%',
                        toggleActions: 'play reverse play reverse',
                    },
                });
            }

            // CTA email link — slide from left with scale
            gsap.from(ctaRef.current, {
                opacity: 0,
                x: -80,
                duration: 1,
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
                    y: 50,
                    scale: 0.95,
                    stagger: 0.15,
                    duration: 0.8,
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
                duration: 1.2,
                ease: 'power3.inOut',
                scrollTrigger: {
                    trigger: footerRef.current,
                    start: 'top 90%',
                    toggleActions: 'play reverse play reverse',
                },
            });

            gsap.from(`.${styles.footerContent}`, {
                opacity: 0,
                y: 20,
                duration: 0.8,
                delay: 0.3,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: footerRef.current,
                    start: 'top 90%',
                    toggleActions: 'play reverse play reverse',
                },
            });

        }, sectionRef);

        return () => ctx.revert();
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
                    <a href="mailto:hello@prajwal.dev" className={styles.emailLink}>
                        <span className={styles.emailLabel}>SAY HELLO</span>
                        <span className={styles.emailAddress}>hello@prajwal.dev</span>
                        <span className={styles.arrow}>→</span>
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
                            BACK TO TOP ↑
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
