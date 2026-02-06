'use client';

import styles from './Section.module.css';

interface SectionProps {
    id: string;
    title: string;
}

export default function Section({ id, title }: SectionProps) {
    return (
        <section id={id} className={styles.section}>
            <h2 className={styles.title}>{title}</h2>
        </section>
    );
}
