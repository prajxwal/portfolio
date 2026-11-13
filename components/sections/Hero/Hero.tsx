'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import styles from './Hero.module.css';
import AsciiBlackHole from '@/components/ui/AsciiBlackHole/AsciiBlackHole';
import { createGooReveal, type GooReveal } from '@/lib/animations/gooReveal';

interface HeroProps {
    animateIn?: boolean;
}

export default function Hero({ animateIn = true }: HeroProps) {
    const heroRef = useRef<HTMLDivElement>(null);
    const nameRef = useRef<HTMLDivElement>(null);
    const holeRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);
    const gooRef = useRef<GooReveal | null>(null);

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

    // Set initial hidden state
    useEffect(() => {
        const isMobile = window.innerWidth <= 768;
        gsap.set(holeRef.current, { opacity: 0 });
        gsap.set(nameRef.current, { opacity: 0, y: isMobile ? 40 : 80 });
        gsap.set(footerRef.current, { opacity: 0, y: isMobile ? 15 : 30 });

        // Name starts as a hidden goo blob; revealed once the preloader is done
        const goo = createGooReveal(nameRef.current?.querySelectorAll('span'), { stagger: 0.15 });
        gooRef.current = goo;
        return () => {
            goo.destroy();
            gooRef.current = null;
        };
    }, []);

    // Animate when animateIn becomes true
    useEffect(() => {
        if (!animateIn || hasAnimated.current) return;
        hasAnimated.current = true;

        const isMobile = window.innerWidth <= 768;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ delay: 0.2 });

            // Fade in the black hole, then the name and footer
            tl.to(holeRef.current, {
                opacity: 1,
                duration: isMobile ? 1.2 : 1.6,
                ease: 'power2.out',
            })
                // Animate name sliding up with stagger effect
                .to(nameRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: isMobile ? 0.9 : 1.2,
                    ease: 'power4.out',
                }, '-=0.6')
                // Animate footer
                .to(footerRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: isMobile ? 0.6 : 0.8,
                    ease: 'power3.out',
                }, '-=0.8');

        }, heroRef);

        gooRef.current?.reveal(isMobile ? 0.5 : 0.6);

        return () => ctx.revert();
    }, [animateIn]);

    return (
        <section id="home" className={styles.hero} ref={heroRef}>
            {/* ASCII black hole — reacts to the cursor */}
            <div className={styles.blackHole} ref={holeRef}>
                <AsciiBlackHole className={styles.blackHoleCanvas} />
            </div>

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
                    <span className={styles.footerDivider}>/</span>
                    <a href="https://www.youtube.com/@saladpy" target="_blank" rel="noopener noreferrer">YOUTUBE</a>
                </div>
                <nav className={styles.footerRight}>
                    <a href="#home">HOME</a>
                    <a href="#about">ABOUT ME</a>
                    <a href="#work">WORK</a>
                    <a href="#contact">CONTACT</a>
                </nav>
            </footer>
        </section>
    );
}
