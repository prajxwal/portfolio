'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import styles from './Hero.module.css';

export default function Hero() {
    const heroRef = useRef<HTMLDivElement>(null);
    const taglineRef = useRef<HTMLParagraphElement>(null);
    const nameRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);

    const [currentTime, setCurrentTime] = useState('');

    // Realtime IST clock
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const istTime = now.toLocaleTimeString('en-IN', {
                timeZone: 'Asia/Kolkata',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            }).toUpperCase();
            setCurrentTime(istTime);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Initial states
            gsap.set(taglineRef.current, { opacity: 0, y: -30 });
            gsap.set(nameRef.current, { opacity: 0, y: 50 });
            gsap.set(footerRef.current, { opacity: 0, y: 20 });

            // Create timeline
            const tl = gsap.timeline({ delay: 0.3 });

            // Animate tagline
            tl.to(taglineRef.current, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power3.out',
            })
                // Animate name
                .to(nameRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: 'power4.out',
                }, '-=0.5')
                // Animate footer
                .to(footerRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                }, '-=0.8');

        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <section id="home" className={styles.hero} ref={heroRef}>
            {/* Tagline at top center */}
            <p className={styles.tagline} ref={taglineRef}>
                <em>A Creative Developer</em> building digital experiences
                <br />that leave a lasting impression.
            </p>

            {/* Large name at bottom */}
            <div className={styles.nameContainer} ref={nameRef}>
                <span className={styles.firstName}>Prajwal</span>
                <span className={styles.lastName}>Jayaram</span>
            </div>

            {/* Footer */}
            <footer className={styles.footer} ref={footerRef}>
                <div className={styles.footerLeft}>
                    <span>INDIA {currentTime}</span>
                </div>
                <div className={styles.footerCenter}>
                    <a href="https://github.com/prajxwal" target="_blank" rel="noopener noreferrer">GITHUB</a>
                    <span className={styles.footerDivider}>/</span>
                    <a href="https://www.linkedin.com/in/prajwaljayaram/" target="_blank" rel="noopener noreferrer">LINKEDIN</a>
                </div>
                <nav className={styles.footerRight}>
                    <a href="#home">HOME</a>
                    <a href="#work">WORK</a>
                    <a href="#about">INFO</a>
                    <a href="#contact">CONTACT</a>
                </nav>
            </footer>
        </section>
    );
}
