'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import styles from './Preloader.module.css';

interface PreloaderProps {
    onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
    const preloaderRef = useRef<HTMLDivElement>(null);
    const topHalfRef = useRef<HTMLDivElement>(null);
    const bottomHalfRef = useRef<HTMLDivElement>(null);
    const [displayText, setDisplayText] = useState('[0]');
    const [phase, setPhase] = useState<'counting' | 'decrypting' | 'ready'>('counting');

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
    const targetText = '[PJ]';

    // Decrypt animation function
    const runDecryptAnimation = useCallback(() => {
        setPhase('decrypting');
        let iteration = 0;
        const maxIterations = 15;

        const interval = setInterval(() => {
            setDisplayText(
                targetText
                    .split('')
                    .map((char, index) => {
                        if (char === '[' || char === ']') return char;
                        if (iteration > index * 3) return char;
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join('')
            );

            iteration += 1;

            if (iteration > maxIterations) {
                clearInterval(interval);
                setDisplayText(targetText);
                setPhase('ready');
            }
        }, 50);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            // Counter animation from 0 to 100
            tl.to({ value: 0 }, {
                value: 100,
                duration: 1.8,
                ease: 'power2.inOut',
                onUpdate: function () {
                    if (phase === 'counting') {
                        setDisplayText(`[${Math.round(this.targets()[0].value)}]`);
                    }
                },
                onComplete: () => {
                    runDecryptAnimation();
                }
            });

        }, preloaderRef);

        return () => ctx.revert();
    }, [phase, runDecryptAnimation]);

    // Split animation after decrypt is ready
    useEffect(() => {
        if (phase !== 'ready') return;

        const timer = setTimeout(() => {
            const tl = gsap.timeline({
                onComplete: () => {
                    onComplete();
                }
            });

            // Small pause then split
            tl.to({}, { duration: 0.4 })
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
                .set(preloaderRef.current, {
                    pointerEvents: 'none',
                    visibility: 'hidden',
                });
        }, 100);

        return () => clearTimeout(timer);
    }, [phase, onComplete]);

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
