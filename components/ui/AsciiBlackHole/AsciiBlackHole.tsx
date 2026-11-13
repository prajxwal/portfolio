'use client';

import { useEffect, useRef } from 'react';

/* ------------------------------------------------------------------ *
 *  AsciiBlackHole
 *  A Gargantua-style black hole drawn as a field of monospace glyphs.
 *
 *  Every character cell is treated as a ray and asked what it sees, in
 *  units of the hole's scale (RSH = shadow radius):
 *
 *    - SHADOW       r < RSH: nothing comes back. Pure black.
 *    - PHOTON RING  a thin, hot ring hugging the shadow edge.
 *    - DIRECT DISK  the accretion disk seen almost edge-on. Its near
 *                   half crosses in front of the shadow as a bright band;
 *                   its far half is hidden behind the hole.
 *    - LENSED DISK  the far side of the disk, bent over the top of the
 *                   shadow (and, fainter, under the bottom) by gravity.
 *                   This arc is what makes it read as a black hole and
 *                   not a planet with rings.
 *
 *  The disk turns at a Keplerian rate (inner edge fastest) and is
 *  Doppler-beamed: the side swinging toward you is brighter.
 *
 *  Mouse:
 *    - the view tilts with the cursor (inclination + roll)
 *    - the hole drifts slightly toward it
 *    - hovering near the disk spins it up
 *    - a small lens around the cursor bends the glyphs under it
 * ------------------------------------------------------------------ */

const RAMP = ' .,:-=+*#%@';
const RSH = 2.6; // shadow radius
const RPH = 2.75; // photon ring radius
const RIN = 3.0; // inner disk edge (ISCO)
const ROUT = 9.5; // outer disk edge

const STAR_CHARS = '.·.·+*';

const smooth = (a: number, b: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
};

const hash = (a: number, b: number) => {
    const h = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
    return h - Math.floor(h);
};

/** Disk brightness at disk radius `rho`, azimuth `phi`. `side` is -1..1,
 *  the horizontal position used for Doppler beaming. */
function emission(rho: number, phi: number, side: number, phase: number) {
    if (rho < RIN || rho > ROUT) return 0;
    const edge = smooth(RIN, RIN + 0.5, rho) * (1 - smooth(ROUT - 3.2, ROUT, rho));
    const base = Math.pow(RIN / rho, 1.25);
    const omega = 1.6 * Math.pow(RIN / rho, 1.5);
    const a = phi + omega * phase;
    const streak =
        0.6 +
        0.24 * Math.sin(a * 3 + rho * 1.7) +
        0.16 * Math.sin(a * 11 - rho * 4.1) * Math.sin(a * 2 + rho * 0.6);
    const doppler = 1 - 0.45 * side;
    return 1.7 * base * edge * streak * doppler;
}

interface Star {
    x: number;
    y: number;
    c: string;
    ph: number;
}

export default function AsciiBlackHole({ className }: { className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        let W = 0;
        let H = 0;
        let cw = 7;
        let ch = 14;
        let cols = 0;
        let rows = 0;
        let s = 50; // px per unit
        let font = '';
        let stars: Star[] = [];
        let occupied = new Uint8Array(0);

        const mouse = { x: 0, y: 0, inside: false };
        const st = { cx: 0, cy: 0, incl: 1.4, roll: 0, lens: 0, spin: 1 };
        let phase = 0;
        let last = performance.now();
        let raf = 0;
        let visible = true;

        const baseCenter = () => ({ x: W / 2, y: H * (W < 700 ? 0.42 : 0.44) });

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            W = rect.width;
            H = rect.height;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(W * dpr);
            canvas.height = Math.round(H * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const fontPx = W < 700 ? 9 : 11;
            font = `${fontPx}px "Martian Mono", "Roboto Mono", monospace`;
            ctx.font = font;
            cw = ctx.measureText('M').width || fontPx * 0.6;
            ch = fontPx * 1.25;
            cols = Math.ceil(W / cw);
            rows = Math.ceil(H / ch);
            occupied = new Uint8Array(cols * rows);
            s = Math.min(W, H) * (W < 700 ? 0.042 : 0.05);

            stars = [];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (hash(c, r) < 0.012) {
                        stars.push({
                            x: (c + 0.5) * cw,
                            y: (r + 0.5) * ch,
                            c: STAR_CHARS[Math.floor(hash(r, c) * STAR_CHARS.length)],
                            ph: hash(c + 7, r + 3) * Math.PI * 2,
                        });
                    }
                }
            }

            const b = baseCenter();
            if (!st.cx) {
                st.cx = b.x;
                st.cy = b.y;
            }
        };

        const buckets: number[][] = Array.from({ length: RAMP.length }, () => []);

        const draw = (now: number) => {
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;

            // ---- ease towards mouse-driven targets
            const b = baseCenter();
            const mx = mouse.inside ? mouse.x : b.x;
            const my = mouse.inside ? mouse.y : b.y;
            const tx = b.x + (mx - b.x) * 0.06;
            const ty = b.y + (my - b.y) * 0.06;
            const inclT = 1.41 + (mouse.inside ? (my / H - 0.5) * 0.24 : 0);
            const rollT = mouse.inside ? (mx / W - 0.5) * -0.28 : -0.06;
            const distToHole = Math.hypot(mx - st.cx, my - st.cy) / s;
            const spinT = mouse.inside && distToHole < ROUT ? 2.8 : 1;
            const lensT = mouse.inside ? 1 : 0;

            const k = 1 - Math.pow(0.001, dt); // frame-rate independent ease
            st.cx += (tx - st.cx) * k;
            st.cy += (ty - st.cy) * k;
            st.incl += (inclT - st.incl) * k;
            st.roll += (rollT - st.roll) * k;
            st.spin += (spinT - st.spin) * k * 0.6;
            st.lens += (lensT - st.lens) * k;
            if (!reduceMotion) phase += dt * 0.55 * st.spin;

            const ci = Math.cos(st.incl);
            const cr = Math.cos(st.roll);
            const sr = Math.sin(st.roll);

            ctx.clearRect(0, 0, W, H);
            ctx.font = font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            occupied.fill(0);
            for (const bk of buckets) bk.length = 0;

            // ---- the hole: only cells inside its bounding box
            const bx = (ROUT + 0.6) * s;
            const by = 7 * s;
            const c0 = Math.max(0, Math.floor((st.cx - bx) / cw));
            const c1 = Math.min(cols - 1, Math.ceil((st.cx + bx) / cw));
            const r0 = Math.max(0, Math.floor((st.cy - by) / ch));
            const r1 = Math.min(rows - 1, Math.ceil((st.cy + by) / ch));

            const LENS_K = 3600 * st.lens;
            const LENS_E = 900;

            for (let r = r0; r <= r1; r++) {
                const py = (r + 0.5) * ch;
                for (let c = c0; c <= c1; c++) {
                    const px = (c + 0.5) * cw;

                    // cursor lens: sample from a point pushed away from the cursor
                    let qx = px;
                    let qy = py;
                    if (LENS_K > 1) {
                        const dx = px - mouse.x;
                        const dy = py - mouse.y;
                        const f = LENS_K / (dx * dx + dy * dy + LENS_E);
                        qx -= dx * f * 0.35;
                        qy -= dy * f * 0.35;
                    }

                    const x0 = (qx - st.cx) / s;
                    const y0 = (qy - st.cy) / s;
                    const x = x0 * cr + y0 * sr;
                    const y = -x0 * sr + y0 * cr;
                    const rr = Math.hypot(x, y);

                    // direct image of the disk (near half in front, far half behind)
                    const Z = y / ci;
                    const rho = Math.hypot(x, Z);
                    let direct = 0;
                    if (rho >= RIN && rho <= ROUT && (y > 0 || rr > RSH)) {
                        direct = emission(rho, Math.atan2(Z, x), x / rho, phase);
                    }

                    let L: number;
                    if (rr < RSH) {
                        L = y > 0 ? direct : 0;
                        if (L < 0.04) {
                            occupied[r * cols + c] = 1; // shadow: keep stars out
                            continue;
                        }
                    } else {
                        // lensed far side: arcs over the top and under the bottom
                        let lensed = 0;
                        const rhoL = RIN + (rr - RPH) * 3.4;
                        if (rhoL >= RIN && rhoL <= ROUT) {
                            const vert = Math.abs(y) / rr;
                            let w = 0.1 + 0.9 * Math.pow(vert, 0.9);
                            if (y > 0) w *= 0.5;
                            lensed = emission(rhoL, Math.atan2(-y, x) + Math.PI, x / rr, phase) * w;
                        }
                        const ring =
                            Math.exp(-(((rr - RPH) / 0.1) ** 2)) * 1.1 +
                            Math.exp(-(((rr - RPH) / 0.4) ** 2)) * 0.25;
                        L = Math.max(direct, lensed) + ring * (direct > 0.3 ? 0.25 : 1);
                    }

                    if (L < 0.04) continue;
                    const idx = Math.max(1, Math.min(RAMP.length - 1, Math.round(Math.pow(Math.min(L, 1), 0.75) * (RAMP.length - 1))));
                    buckets[idx].push(px, py);
                    occupied[r * cols + c] = 1;
                }
            }

            // ---- background stars, lensed outward around the hole
            const RE2 = (RSH * 1.15) ** 2;
            for (const star of stars) {
                let sx = star.x;
                let sy = star.y;
                const dx = (sx - st.cx) / s;
                const dy = (sy - st.cy) / s;
                const d = Math.hypot(dx, dy) || 0.001;
                const push = (d + RE2 / d) / d;
                sx = st.cx + dx * push * s;
                sy = st.cy + dy * push * s;
                const c = Math.floor(sx / cw);
                const r = Math.floor(sy / ch);
                if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
                if (occupied[r * cols + c]) continue;
                const tw = reduceMotion ? 0.5 : 0.5 + 0.5 * Math.sin(now * 0.0013 + star.ph);
                ctx.fillStyle = `rgba(255,255,255,${0.15 + 0.35 * tw})`;
                ctx.fillText(star.c, (c + 0.5) * cw, (r + 0.5) * ch);
            }

            // ---- the hole, one fillStyle per brightness level
            for (let i = 1; i < RAMP.length; i++) {
                const bk = buckets[i];
                if (!bk.length) continue;
                ctx.fillStyle = `rgba(255,255,255,${0.28 + (0.72 * i) / (RAMP.length - 1)})`;
                const glyph = RAMP[i];
                for (let j = 0; j < bk.length; j += 2) ctx.fillText(glyph, bk[j], bk[j + 1]);
            }
        };

        const loop = (now: number) => {
            draw(now);
            raf = visible ? requestAnimationFrame(loop) : 0;
        };

        const onMove = (e: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
            mouse.inside = mouse.x >= 0 && mouse.y >= 0 && mouse.x <= rect.width && mouse.y <= rect.height;
        };
        const onLeave = () => {
            mouse.inside = false;
        };

        resize();
        // Re-measure once the web font is in, so cells match the glyph width
        document.fonts?.ready.then(resize).catch(() => {});

        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        // Stop rendering when the hero is scrolled away
        const io = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible && !raf) {
                last = performance.now();
                raf = requestAnimationFrame(loop);
            }
        });
        io.observe(canvas);

        window.addEventListener('pointermove', onMove, { passive: true });
        document.documentElement.addEventListener('pointerleave', onLeave);
        raf = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            io.disconnect();
            window.removeEventListener('pointermove', onMove);
            document.documentElement.removeEventListener('pointerleave', onLeave);
        };
    }, []);

    return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
