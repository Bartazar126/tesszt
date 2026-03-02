'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/context';
import styles from '../admin.module.css';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'es', label: 'Español' },
    { code: 'it', label: 'Italiano' },
];

interface FAQItem {
    id: string;
    question: Record<string, string>;
    answer: Record<string, string>;
}

export default function AdminFAQPage() {
    const { t } = useI18n();
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api/admin/faq')
            .then((res) => res.json())
            .then((data) => setFaqs(data.faqs ?? []))
            .catch(() => setFaqs([]))
            .finally(() => setLoading(false));
    }, []);

    const handleAdd = () => {
        const newFaq: FAQItem = {
            id: Date.now().toString(),
            question: {},
            answer: {},
        };
        setFaqs([...faqs, newFaq]);
    };

    const handleDelete = (id: string) => {
        setFaqs(faqs.filter(f => f.id !== id));
    };

    const handleChange = (id: string, field: 'question' | 'answer', lang: string, value: string) => {
        setFaqs(faqs.map(f => {
            if (f.id === id) {
                return {
                    ...f,
                    [field]: {
                        ...f[field],
                        [lang]: value
                    }
                };
            }
            return f;
        }));
    };

    const handleMoveUp = (index: number) => {
        if (index === 0) return;
        const newFaqs = [...faqs];
        [newFaqs[index - 1], newFaqs[index]] = [newFaqs[index], newFaqs[index - 1]];
        setFaqs(newFaqs);
    };

    const handleMoveDown = (index: number) => {
        if (index === faqs.length - 1) return;
        const newFaqs = [...faqs];
        [newFaqs[index + 1], newFaqs[index]] = [newFaqs[index], newFaqs[index + 1]];
        setFaqs(newFaqs);
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            const res = await fetch('/api/admin/faq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ faqs }),
            });
            if (res.ok) {
                setMessage('Sikeresen mentve!');
            } else {
                setMessage('Hiba történt a mentés során.');
            }
        } catch {
            setMessage('Hálózati hiba.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

    return (
        <main className={styles.main}>
            <div className={styles.shell}>
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarTitle}>Admin</div>
                    <nav className={styles.menu}>
            <Link href="/admin" className={styles.menuItem}>Dashboard</Link>
            <Link href="/admin/tickets" className={styles.menuItem}>Manage tickets</Link>
            <Link href="/admin/orders" className={styles.menuItem}>{t('admin.orders') || 'Orders'}</Link>
            <Link href="/admin/stripe" className={styles.menuItem}>Stripe API</Link>
            <Link href="/admin/reviews" className={styles.menuItem}>Reviews</Link>
                        <Link href="/admin/terms" className={styles.menuItem}>{t('admin.terms') || 'Terms'}</Link>
            <Link href="/admin/about" className={styles.menuItem}>{t('admin.about') || 'About Us'}</Link>
            <Link href="/admin/privacy" className={styles.menuItem}>{t('admin.privacy') || 'Privacy'}</Link>
            <Link href="/admin/faq" className={`${styles.menuItem} ${styles.menuItemActive}`}>{t('admin.faq') || 'FAQ'}</Link>
            <Link href="/admin/disclaimer-site" className={styles.menuItem}>{t('admin.disclaimerSite') || 'Disclaimer Site'}</Link>
            <Link href="/admin/disclaimer" className={styles.menuItem}>{t('admin.disclaimer') || 'Disclaimer'}</Link>
            <Link href="/admin/company" className={styles.menuItem}>{t('admin.company') || 'Company'}</Link>
            <Link href="/admin/guide" className={styles.menuItem}>Guide</Link>
            <button onClick={handleLogout} className={styles.menuItem} style={{ textAlign: 'left', cursor: 'pointer', background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', width: '100%', padding: '10px 15px', marginTop: '10px' }}>Logout</button>
          </nav>
                </aside>

                <section className={styles.content}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h1 className={styles.title} style={{ marginBottom: 0 }}>{t('admin.faq') || 'FAQ'}</h1>
                        <button
                            onClick={handleAdd}
                            className={styles.editBtn}
                            style={{ background: '#2563eb', color: '#fff', border: 'none' }}
                        >
                            + Új kérdés hozzáadása
                        </button>
                    </div>

                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
                        {loading ? (
                            <p className={styles.loading}>Betöltés…</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                {faqs.length === 0 && (
                                    <p style={{ color: '#666', fontStyle: 'italic' }}>Nincsenek még kérdések rögzítve.</p>
                                )}

                                {faqs.map((faq, index) => (
                                    <div key={faq.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem', position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => handleMoveUp(index)} disabled={index === 0} style={{ cursor: index === 0 ? 'not-allowed' : 'pointer', background: 'none', border: '1px solid #ddd', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>↑</button>
                                            <button onClick={() => handleMoveDown(index)} disabled={index === faqs.length - 1} style={{ cursor: index === faqs.length - 1 ? 'not-allowed' : 'pointer', background: 'none', border: '1px solid #ddd', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>↓</button>
                                            <button onClick={() => handleDelete(faq.id)} style={{ cursor: 'pointer', background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', marginLeft: '0.5rem' }}>Törlés</button>
                                        </div>

                                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Kérdés #{index + 1}</h3>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            {LANGUAGES.map((lang) => (
                                                <div key={lang.code} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#4b5563' }}>
                                                            Kérdés ({lang.label})
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={faq.question[lang.code] || ''}
                                                            onChange={(e) => handleChange(faq.id, 'question', lang.code, e.target.value)}
                                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                                                            placeholder="Pl. Honnan indul a hajó?"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#4b5563' }}>
                                                            Válasz ({lang.label})
                                                        </label>
                                                        <textarea
                                                            value={faq.answer[lang.code] || ''}
                                                            onChange={(e) => handleChange(faq.id, 'answer', lang.code, e.target.value)}
                                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', minHeight: '80px', fontFamily: 'inherit' }}
                                                            placeholder="Pl. A hajók az 1-es kikötőből indulnak..."
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className={styles.editBtn}
                                        style={{ background: '#111', color: '#fff', border: 'none' }}
                                    >
                                        {saving ? 'Mentés...' : 'Mentés'}
                                    </button>
                                    {message && <span style={{ color: message.includes('Siker') ? 'green' : 'red', fontWeight: 500 }}>{message}</span>}
                                </div>
                            </div>
                        )}
                    </div>

                    <Link href="/" className={styles.back}>{t('nav.home')}</Link>
                </section>
            </div>
        </main>
    );
}
