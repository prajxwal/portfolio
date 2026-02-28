'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import styles from './FlowingMenu.module.css';

interface FlowingMenuItem {
    link: string;
    text: string;
    image: string;
    category: string;
    year: string;
}

interface FlowingMenuProps {
    items?: FlowingMenuItem[];
    speed?: number;
}

export default function FlowingMenu({ items = [], speed = 15 }: FlowingMenuProps) {
    return (
        <div className={styles.menuWrapper}>
            <nav className={styles.menuNav}>
                {items.map((item, idx) => (
                    <MenuItem
                        key={idx}
                        index={idx}
                        {...item}
                        speed={speed}
                    />
                ))}
            </nav>
        </div>
    );
}

interface MenuItemProps {
    link: string;
    text: string;
    image: string;
    category: string;
    year: string;
    speed: number;
    index: number;
}

function MenuItem({ link, text, image, category, year, speed, index }: MenuItemProps) {
    const itemRef = useRef<HTMLDivElement>(null);
    const marqueeRef = useRef<HTMLDivElement>(null);
    const marqueeInnerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<gsap.core.Tween | null>(null);
    const [repetitions, setRepetitions] = useState(4);

    const animationDefaults = { duration: 0.6, ease: 'expo' };

    const findClosestEdge = (mouseX: number, mouseY: number, width: number, height: number) => {
        const topEdgeDist = (mouseX - width / 2) ** 2 + mouseY ** 2;
        const bottomEdgeDist = (mouseX - width / 2) ** 2 + (mouseY - height) ** 2;
        return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
    };

    useEffect(() => {
        const calculateRepetitions = () => {
            if (!marqueeInnerRef.current) return;
            const marqueeContent = marqueeInnerRef.current.querySelector(`.${styles.marqueePart}`) as HTMLElement;
            if (!marqueeContent) return;
            const contentWidth = marqueeContent.offsetWidth;
            if (contentWidth === 0) return;
            const viewportWidth = window.innerWidth;
            const needed = Math.ceil(viewportWidth / contentWidth) + 2;
            setRepetitions(Math.max(4, needed));
        };

        calculateRepetitions();
        window.addEventListener('resize', calculateRepetitions);
        return () => window.removeEventListener('resize', calculateRepetitions);
    }, [text, image]);

    useEffect(() => {
        const setupMarquee = () => {
            if (!marqueeInnerRef.current) return;
            const marqueeContent = marqueeInnerRef.current.querySelector(`.${styles.marqueePart}`) as HTMLElement;
            if (!marqueeContent) return;
            const contentWidth = marqueeContent.offsetWidth;
            if (contentWidth === 0) return;

            if (animationRef.current) {
                animationRef.current.kill();
            }

            animationRef.current = gsap.to(marqueeInnerRef.current, {
                x: -contentWidth,
                duration: speed,
                ease: 'none',
                repeat: -1,
            });
        };

        const timer = setTimeout(setupMarquee, 50);
        return () => {
            clearTimeout(timer);
            if (animationRef.current) {
                animationRef.current.kill();
            }
        };
    }, [text, image, repetitions, speed]);

    const handleMouseEnter = useCallback((ev: React.MouseEvent) => {
        if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
        const rect = itemRef.current.getBoundingClientRect();
        const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);

        gsap
            .timeline({ defaults: animationDefaults })
            .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
            .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
            .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' }, 0);
    }, []);

    const handleMouseLeave = useCallback((ev: React.MouseEvent) => {
        if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
        const rect = itemRef.current.getBoundingClientRect();
        const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);

        gsap
            .timeline({ defaults: animationDefaults })
            .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
            .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0);
    }, []);

    const num = String(index + 1).padStart(2, '0');

    return (
        <div
            className={styles.menuItem}
            ref={itemRef}
        >
            <a
                className={styles.menuLink}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <span className={styles.itemNumber}>{num}</span>
                <span className={styles.itemTitle}>{text}</span>
                <div className={styles.itemMeta}>
                    <span className={styles.itemCategory}>{category}</span>
                    <span className={styles.itemYear}>{year}</span>
                </div>
            </a>
            <div
                className={styles.marqueeOverlay}
                ref={marqueeRef}
            >
                <div className={styles.marqueeInner} ref={marqueeInnerRef}>
                    {[...Array(repetitions)].map((_, idx) => (
                        <div className={styles.marqueePart} key={idx}>
                            <span className={styles.marqueeText}>{text}</span>
                            <div
                                className={styles.marqueeImage}
                                style={{ backgroundImage: `url(${image})` }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
