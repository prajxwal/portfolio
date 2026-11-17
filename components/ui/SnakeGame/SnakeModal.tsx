'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import SnakeGame, { type SnakeStatus } from './SnakeGame';
import styles from './SnakeModal.module.css';
import { getTheme } from '@/lib/theme';

const BEST_KEY = 'snake-best';

interface SnakeModalProps {
    open: boolean;
    onClose: () => void;
}

export default function SnakeModal({ open, onClose }: SnakeModalProps) {
    const [score, setScore] = useState(0);
    const [best, setBest] = useState(0);
    const [status, setStatus] = useState<SnakeStatus>('demo');
    const quitRef = useRef<HTMLButtonElement>(null);

    // Best score survives reloads when storage is available
    useEffect(() => {
        try {
            setBest(Number(localStorage.getItem(BEST_KEY)) || 0);
        } catch {}
    }, []);

    useEffect(() => {
        if (score <= best) return;
        setBest(score);
        try {
            localStorage.setItem(BEST_KEY, String(score));
        } catch {}
    }, [score, best]);

    // Esc to quit, lock page scroll while open
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        const prevOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = 'hidden';
        quitRef.current?.focus();
        return () => {
            window.removeEventListener('keydown', onKey);
            document.documentElement.style.overflow = prevOverflow;
        };
    }, [open, onClose]);

    useEffect(() => {
        if (!open) {
            setScore(0);
            setStatus('demo');
        }
    }, [open]);

    if (!open || typeof document === 'undefined') return null;

    const light = getTheme() === 'light';

    const hint =
        status === 'demo'
            ? 'press an arrow key / WASD to play — or swipe'
            : status === 'over'
              ? `game over. ${score} eaten. any direction to go again`
              : 'esc to quit';

    return createPortal(
        <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-label="Snake game"
            data-lenis-prevent
        >
            <div className={styles.panel}>
                <header className={styles.bar}>
                    <span className={styles.title}>I AM BORED.</span>
                    <span className={styles.score}>
                        SCORE {String(score).padStart(2, '0')}
                        <span className={styles.sep}>/</span>
                        BEST {String(best).padStart(2, '0')}
                    </span>
                    <button ref={quitRef} type="button" className={styles.quit} onClick={onClose}>
                        QUIT <span aria-hidden="true">✕</span>
                    </button>
                </header>

                <div className={styles.board}>
                    <SnakeGame
                        onScore={setScore}
                        onStatus={setStatus}
                        snakeColor={light ? '#000000' : '#FFFFFF'}
                        boardColor={light ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.06)'}
                    />
                </div>

                <p className={styles.hint}>{hint}</p>
            </div>
        </div>,
        document.body
    );
}
