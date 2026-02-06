'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import styles from './Preloader.module.css';

interface PreloaderProps {
    onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
    const preloaderRef = useRef<HTMLDivElement>(null);
    const counterRef = useRef<HTMLSpanElement>(null);
    const logoRef = useRef<HTMLSpanElement>(null);
    const topHalfRef = useRef<HTMLDivElement>(null);
    const bottomHalfRef = useRef<HTMLDivElement>(null);
    const [count, setCount] = useState(0);
    const [showLogo, setShowLogo] = useState(false);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                onComplete: () => {
                    onComplete();
                }
            });

            // Counter animation from 0 to 100
            tl.to({ value: 0 }, {
                value: 100,
                duration: 1.5,
                ease: 'power2.inOut',
                onUpdate: function () {
                    setCount(Math.round(this.targets()[0].value));
                }
            })
                // Switch to logo
                .call(() => setShowLogo(true))
                // Hold for a moment
                .to({}, { duration: 0.5 })
                // Split screen animation
                .to(topHalfRef.current, {
                    yPercent: -100,
                    duration: 0.8,
                    ease: 'power4.inOut',
                })
                .to(bottomHalfRef.current, {
                    yPercent: 100,
                    duration: 0.8,
                    ease: 'power4.inOut',
                }, '<')
                // Fade out preloader
                .set(preloaderRef.current, {
                    pointerEvents: 'none',
                    visibility: 'hidden',
                });

        }, preloaderRef);

        return () => ctx.revert();
    }, [onComplete]);

    const displayText = showLogo ? '[PJ]' : `[${count}]`;

    return (
        <div className={styles.preloader} ref={preloaderRef}>
            {/* Top half */}
            <div className={styles.half} ref={topHalfRef}>
                <span className={styles.text}>{displayText}</span>
            </div>
            {/* Bottom half */}
            <div className={styles.halfBottom} ref={bottomHalfRef}>
                <span className={styles.text}>{displayText}</span>
            </div>
        </div>
    );
}
