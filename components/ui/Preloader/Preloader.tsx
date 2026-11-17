'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { holeCenter } from '@/components/ui/AsciiBlackHole/AsciiBlackHole';
import { fgRGB } from '@/lib/theme';
import styles from './Preloader.module.css';

/* ------------------------------------------------------------------ *
 *  Preloader: the black hole's origin story.
 *
 *    1. COUNT     a field of ASCII stars, counter at the centre. As it
 *                 climbs, the stars are pulled inward and spin faster,
 *                 stretching into streaks.
 *    2. COLLAPSE  everything left is crushed into a point; the counter
 *                 goes with it.
 *    3. FLASH     a white burst. `onReveal` fires here so the hero's hole
 *                 is born out of the flash.
 *    4. FADE      the loader dissolves over the newborn hole, then
 *                 `onDone` unmounts it.
 *
 *  The collapse point is the hero hole's centre (holeCenter), so the
 *  handoff lands on the same pixel.
 * ------------------------------------------------------------------ */

interface PreloaderProps {
    /** Collapse finished: start the hero (the hole is born now) */
    onReveal: () => void;
    /** Loader fully faded: safe to unmount */
    onDone: () => void;
}

interface Particle {
    r0: number;
    theta: number;
    c: string;
    a: number;
    spin: number;
}

const STAR_CHARS = '..··:+*';
const TRAIL_CHARS = '.:-=';

export default function Preloader({ onReveal, onDone }: PreloaderProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const counterRef = useRef<HTMLSpanElement>(null);
    const flashRef = useRef<HTMLDivElement>(null);
    const cbRef = useRef({ onReveal, onDone });
    cbRef.current = { onReveal, onDone };

    useEffect(() => {
        const canvas = canvasRef.current;
        const root = rootRef.current;
        const counter = counterRef.current;
        if (!canvas || !root || !counter) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        let W = 0;
        let H = 0;
        let cw = 7;
        let ch = 14;
        let font = '';
        let cx = 0;
        let cy = 0;
        let maxR = 1;
        let particles: Particle[] = [];

        const state = { p: 0, c: 0 }; // progress 0..1, collapse 0..1

        const resize = () => {
            W = window.innerWidth;
            H = window.innerHeight;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(W * dpr);
            canvas.height = Math.round(H * dpr);
            canvas.style.width = `${W}px`;
            canvas.style.height = `${H}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const fontPx = W < 700 ? 9 : 11;
            font = `${fontPx}px "Martian Mono", "Roboto Mono", monospace`;
            ctx.font = font;
            cw = ctx.measureText('M').width || fontPx * 0.6;
            ch = fontPx * 1.25;

            const c = holeCenter(W, H);
            cx = c.x;
            cy = c.y;
            maxR = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy));
            counter.style.left = `${cx}px`;
            counter.style.top = `${cy}px`;
            if (flashRef.current) {
                flashRef.current.style.left = `${cx}px`;
                flashRef.current.style.top = `${cy}px`;
            }

            const count = Math.round(((W * H) / (cw * ch)) * 0.045);
            particles = Array.from({ length: count }, () => {
                // sqrt for an even spread over the area, not bunched at the centre
                const r0 = Math.sqrt(Math.random()) * maxR * 1.05 + 12;
                // ~65% sit on two logarithmic spiral arms; the rest are loose stars.
                // Inner stars orbit faster, so the arms wind tighter as they fall.
                const onArm = Math.random() < 0.65;
                const arm = Math.random() < 0.5 ? 0 : Math.PI;
                const theta = onArm
                    ? arm + Math.log(r0 / 12) * 1.9 + (Math.random() - 0.5) * 0.55
                    : Math.random() * Math.PI * 2;
                return {
                    r0,
                    theta,
                    c: STAR_CHARS[Math.floor(Math.random() * STAR_CHARS.length)],
                    a: onArm ? 0.45 + Math.random() * 0.55 : 0.25 + Math.random() * 0.45,
                    spin: 0.85 + Math.random() * 0.3,
                };
            });
        };

        let last = performance.now();
        let raf = 0;

        const draw = (now: number) => {
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            const { p, c } = state;
            const fg = fgRGB();

            ctx.clearRect(0, 0, W, H);
            ctx.font = font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // How much of each star's starting radius has been eaten
            const pull = 0.62 * (p * p * (3 - 2 * p));
            const keep = (1 - pull) * (1 - c);
            // the swirl tips over into the plane of the disk it's about to become
            const flat = 0.95 - 0.55 * Math.min(1, p * p + c);

            for (const pt of particles) {
                const r = pt.r0 * keep;
                if (r < 6) continue; // crossed the horizon

                // Faster as it falls in, roughly Keplerian, plus a big kick in the collapse
                const omega = (0.08 + 1.6 * p + 9 * c) * pt.spin * Math.sqrt(maxR / Math.max(r, 30)) * 0.35;
                if (!reduceMotion) pt.theta += omega * dt;

                const alpha = pt.a * (0.65 + 0.35 * p) * (1 - c * 0.3);
                const x = cx + Math.cos(pt.theta) * r;
                const y = cy + Math.sin(pt.theta) * r * flat;

                // snap to the character grid so it stays ASCII
                const gx = (Math.round(x / cw - 0.5) + 0.5) * cw;
                const gy = (Math.round(y / ch - 0.5) + 0.5) * ch;
                ctx.fillStyle = `rgba(${fg},${alpha})`;
                ctx.fillText(pt.c, gx, gy);

                // streaks: a short tail of dimmer glyphs behind it along the orbit
                const speed = omega * r;
                const tail = Math.min(5, Math.floor(speed / 40));
                if (tail > 0) {
                    const step = (cw * 1.1) / Math.max(r, 1);
                    for (let k = 1; k <= tail; k++) {
                        const th = pt.theta - step * k;
                        const tx = cx + Math.cos(th) * r;
                        const ty = cy + Math.sin(th) * r * flat;
                        ctx.fillStyle = `rgba(${fg},${alpha * (1 - k / (tail + 1)) * 0.8})`;
                        ctx.fillText(
                            TRAIL_CHARS[Math.min(TRAIL_CHARS.length - 1, tail - k)],
                            (Math.round(tx / cw - 0.5) + 0.5) * cw,
                            (Math.round(ty / ch - 0.5) + 0.5) * ch
                        );
                    }
                }
            }

            raf = requestAnimationFrame(draw);
        };

        resize();
        window.addEventListener('resize', resize);
        raf = requestAnimationFrame(draw);

        gsap.set(counter, { xPercent: -50, yPercent: -50 });

        const setCount = () => {
            counter.textContent = `[${Math.round(state.p * 100)}]`;
        };
        setCount();

        const tl = gsap.timeline();
        tl.to(state, {
            p: 1,
            duration: reduceMotion ? 0.6 : 2.6,
            ease: 'power1.inOut',
            onUpdate: setCount,
        })
            // 2. collapse
            .to(state, { c: 1, duration: reduceMotion ? 0.2 : 0.6, ease: 'power3.in' }, '+=0.15')
            .to(counter, { scale: 0, opacity: 0, duration: 0.5, ease: 'power3.in' }, '<0.05')
            // 3. flash — the hole is born now
            .add(() => cbRef.current.onReveal())
            .fromTo(
                flashRef.current,
                { scale: 0, opacity: 1 },
                { scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out' }
            )
            // 4. dissolve over the newborn hole
            .to(root, { opacity: 0, duration: 0.6, ease: 'power2.out' }, '<0.1')
            .add(() => cbRef.current.onDone());

        return () => {
            tl.kill();
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <div className={styles.preloader} ref={rootRef} aria-hidden="true">
            <canvas ref={canvasRef} className={styles.canvas} />
            <span className={styles.counter} ref={counterRef} />
            <div className={styles.flash} ref={flashRef} />
        </div>
    );
}
