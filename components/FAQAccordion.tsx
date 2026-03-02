'use client';

import { useState } from 'react';
import styles from './faq.module.css';

interface FAQ {
    id: string;
    question: string;
    answer: string;
}

interface Props {
    faqs: FAQ[];
}

export function FAQAccordion({ faqs }: Props) {
    const [openId, setOpenId] = useState<string | null>(null);

    const toggleFaq = (id: string) => {
        setOpenId(openId === id ? null : id);
    };

    if (!faqs || faqs.length === 0) return null;

    return (
        <div className={styles.accordionGroup}>
            {faqs.map((faq) => {
                const isOpen = openId === faq.id;
                return (
                    <div key={faq.id} className={`${styles.accordionItem} ${isOpen ? styles.open : ''}`}>
                        <button
                            className={styles.accordionHeader}
                            onClick={() => toggleFaq(faq.id)}
                            aria-expanded={isOpen}
                        >
                            <span className={styles.question}>{faq.question}</span>
                            <span className={styles.icon}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.chevron}>
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </span>
                        </button>
                        <div
                            className={styles.accordionBody}
                            style={{
                                maxHeight: isOpen ? '1000px' : '0',
                                opacity: isOpen ? 1 : 0,
                                overflow: 'hidden',
                                transition: 'all 0.3s ease-in-out'
                            }}
                        >
                            <div className={styles.answerContent}>
                                {faq.answer}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
