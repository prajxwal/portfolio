import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(CustomEase, ScrollTrigger);

/* ------------------------------------------------------------------ *
 *  Goo reveal
 *  Each line gets its own SVG filter: a Gaussian blur followed by a
 *  colour matrix that multiplies alpha and subtracts an offset. At a
 *  heavy blur the threshold eats the faint edges, so the line reads as a
 *  solid, liquid blob. Easing the blur to 0 condenses the blob into the
 *  glyphs, and the alpha matrix relaxes back to identity at the tail so
 *  the anti-aliasing comes back clean.
 * ------------------------------------------------------------------ */

const SVG_NS = 'http://www.w3.org/2000/svg';
const DEFS_ID = 'goo-defs';

const BLUR_MAX = 50;
const AMP_MAX = 20;
const OFF_MAX = -8;

const matrix = (amp: number, off: number) =>
    `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${amp} ${off}`;

if (typeof window !== 'undefined' && !CustomEase.get('gooOut')) {
    CustomEase.create('gooOut', '0.25,1,0.5,1');
    CustomEase.create('gooIn', '0.5,0,0.75,0');
}

let uid = 0;

function getDefs(): SVGSVGElement {
    let svg = document.getElementById(DEFS_ID) as SVGSVGElement | null;
    if (!svg) {
        svg = document.createElementNS(SVG_NS, 'svg');
        svg.id = DEFS_ID;
        svg.setAttribute('aria-hidden', 'true');
        svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';
        document.body.prepend(svg);
    }
    return svg;
}

interface GooLine {
    el: HTMLElement;
    id: string;
    filter: SVGFilterElement;
    blur: SVGFEGaussianBlurElement;
    cm: SVGFEColorMatrixElement;
    s: { blur: number; amp: number; off: number };
}

function createLine(el: HTMLElement): GooLine {
    const id = `goo-${++uid}`;
    const filter = document.createElementNS(SVG_NS, 'filter');
    filter.id = id;
    filter.setAttribute('x', '-25%');
    filter.setAttribute('y', '-25%');
    filter.setAttribute('width', '150%');
    filter.setAttribute('height', '150%');
    filter.setAttribute('color-interpolation-filters', 'sRGB');

    const blur = document.createElementNS(SVG_NS, 'feGaussianBlur');
    blur.setAttribute('in', 'SourceGraphic');
    blur.setAttribute('result', 'blur');

    const cm = document.createElementNS(SVG_NS, 'feColorMatrix');
    cm.setAttribute('in', 'blur');
    cm.setAttribute('mode', 'matrix');
    cm.setAttribute('result', 'goo');

    filter.append(blur, cm);
    getDefs().appendChild(filter);

    return { el, id, filter, blur, cm, s: { blur: 0, amp: 1, off: 0 } };
}

function paint(l: GooLine) {
    l.blur.setAttribute('stdDeviation', String(l.s.blur));
    l.cm.setAttribute('values', matrix(l.s.amp, l.s.off));
}

export interface GooRevealOptions {
    /** Seconds for one line to condense */
    duration?: number;
    /** Seconds between lines */
    stagger?: number;
    /** Element whose scroll position drives the reveal. Omit to drive it manually. */
    trigger?: Element | null;
    /** ScrollTrigger start */
    start?: string;
    /** Delay before the first line, seconds */
    delay?: number;
}

export interface GooReveal {
    reveal: (delay?: number) => void;
    hide: () => void;
    destroy: () => void;
}

export function createGooReveal(
    targets: ArrayLike<Element> | null | undefined,
    {
        duration = 1.2,
        stagger = 0.1,
        trigger = null,
        start = 'top 85%',
        delay = 0,
    }: GooRevealOptions = {}
): GooReveal {
    const lines = Array.from(targets ?? []).map((el) => createLine(el as HTMLElement));
    let tl: gsap.core.Timeline | null = null;

    const setHidden = () => {
        for (const l of lines) {
            l.s.blur = BLUR_MAX;
            l.s.amp = AMP_MAX;
            l.s.off = OFF_MAX;
            paint(l);
            l.el.style.filter = `url(#${l.id})`;
        }
    };

    const reveal = (d = delay) => {
        tl?.kill();
        setHidden();
        tl = gsap.timeline({ delay: d });
        lines.forEach((l, i) => {
            const at = i * stagger;
            tl!.to(l.s, { blur: 0, duration, ease: 'gooOut', onUpdate: () => paint(l) }, at);
            tl!.to(
                l.s,
                {
                    amp: 1,
                    off: 0,
                    duration: duration * 0.35,
                    ease: 'none',
                    onUpdate: () => paint(l),
                    // Drop the filter once settled: crisp text, no per-frame filter cost
                    onComplete: () => {
                        l.el.style.filter = '';
                    },
                },
                at + duration * 0.65
            );
        });
    };

    const hide = () => {
        tl?.kill();
        tl = gsap.timeline();
        lines.forEach((l, i) => {
            const at = i * stagger * 0.5;
            l.el.style.filter = `url(#${l.id})`;
            tl!.to(l.s, { amp: AMP_MAX, off: OFF_MAX, duration: 0.12, ease: 'none', onUpdate: () => paint(l) }, at);
            tl!.to(l.s, { blur: BLUR_MAX, duration: 0.4, ease: 'gooIn', onUpdate: () => paint(l) }, at);
        });
    };

    setHidden();

    const st = trigger
        ? ScrollTrigger.create({
              trigger,
              start,
              onEnter: () => reveal(),
              onLeaveBack: () => hide(),
          })
        : null;

    const destroy = () => {
        tl?.kill();
        st?.kill();
        for (const l of lines) {
            l.el.style.filter = '';
            l.filter.remove();
        }
    };

    return { reveal, hide, destroy };
}
