'use client';

import { useEffect, useState } from 'react';
import { Nav } from '@/components/Nav';
import { useI18n } from '@/i18n/context';
import styles from '../page.module.css';

export default function TermsPage() {
    const { locale, t } = useI18n();
    const [terms, setTerms] = useState('');

    useEffect(() => {
        fetch(`/api/terms?lang=${locale}`)
            .then(res => res.json())
            .then(data => {
                if (data.text) setTerms(data.text);
            })
            .catch(err => console.error(err));
    }, [locale]);

    return (
        <main style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Nav />
            <section className={styles.legalWrapper}>
                <div className={styles.legalCard}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '8px',
                        background: 'linear-gradient(90deg, #1f2937, #1e3a8a)'
                    }} />

                    <h1 style={{
                        marginBottom: '1rem',
                        fontSize: '3rem',
                        fontWeight: 800,
                        letterSpacing: '-1px',
                        color: '#111'
                    }}>
                        {t('footer.terms') || 'Terms of Service'}
                    </h1>

                    <div className="terms-content"
                        dangerouslySetInnerHTML={{ __html: terms }}
                        style={{ whiteSpace: 'normal', lineHeight: 1.8, color: '#4b5563', fontSize: '1.1rem' }}
                    />

                    <style dangerouslySetInnerHTML={{
                        __html: `
                        .terms-content p {
                            margin-bottom: 1.5rem;
                            min-height: 1rem;
                        }
                        .terms-content h2 {
                            margin-top: 3rem;
                            margin-bottom: 1.5rem;
                            font-size: 1.8rem;
                            color: #111;
                            border-bottom: 2px solid #f3f4f6;
                            padding-bottom: 0.5rem;
                        }
                        .terms-content h3 {
                            margin-top: 2rem;
                            margin-bottom: 1rem;
                            font-size: 1.4rem;
                            color: #374151;
                        }
                        .terms-content ul {
                            margin-bottom: 2rem;
                            padding-left: 1.5rem;
                            list-style-type: none;
                        }
                        .terms-content ul li {
                            position: relative;
                            margin-bottom: 0.5rem;
                            padding-left: 1.5rem;
                        }
                        .terms-content ul li::before {
                            content: "•";
                            color: #1e3a8a;
                            font-weight: bold;
                            position: absolute;
                            left: 0;
                            font-size: 1.2rem;
                        }
                        .terms-content strong {
                            color: #1f2937;
                            font-weight: 600;
                        }
                    `}} />
                </div>
            </section>
        </main>
    );
}
