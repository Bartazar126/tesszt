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

export default function AdminDisclaimerPage() {
    const { t } = useI18n();
    const [disclaimers, setDisclaimers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api/admin/disclaimer')
            .then((res) => res.json())
            .then((data) => setDisclaimers(data.disclaimer ?? {}))
            .catch(() => setDisclaimers({}))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (lang: string, value: string) => {
        setDisclaimers((prev) => ({
            ...prev,
            [lang]: value,
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            const res = await fetch('/api/admin/disclaimer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ disclaimer: disclaimers }),
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
            <Link href="/admin/faq" className={styles.menuItem}>{t('admin.faq') || 'FAQ'}</Link>
            <Link href="/admin/disclaimer-site" className={styles.menuItem}>{t('admin.disclaimerSite') || 'Disclaimer Site'}</Link>
            <Link href="/admin/disclaimer" className={`${styles.menuItem} ${styles.menuItemActive}`}>{t('admin.disclaimer') || 'Disclaimer'}</Link>
            <Link href="/admin/company" className={styles.menuItem}>{t('admin.company') || 'Company'}</Link>
            <Link href="/admin/guide" className={styles.menuItem}>Guide</Link>
            <button onClick={handleLogout} className={styles.menuItem} style={{ textAlign: 'left', cursor: 'pointer', background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', width: '100%', padding: '10px 15px', marginTop: '10px' }}>Logout</button>
          </nav>
                </aside>

                <section className={styles.content}>
                    <h1 className={styles.title}>{t('admin.disclaimer') || 'Disclaimer'}</h1>

                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
                        {loading ? (
                            <p className={styles.loading}>Betöltés…</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {LANGUAGES.map((lang) => (
                                    <div key={lang.code}>
                                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                            {lang.label} ({lang.code})
                                        </label>
                                        <textarea
                                            value={disclaimers[lang.code] || ''}
                                            onChange={(e) => handleChange(lang.code, e.target.value)}
                                            style={{
                                                width: '100%',
                                                minHeight: '120px',
                                                padding: '0.8rem',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                fontFamily: 'inherit',
                                                resize: 'vertical'
                                            }}
                                        />
                                    </div>
                                ))}

                                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className={styles.editBtn}
                                        style={{ background: '#111', color: '#fff', border: 'none' }}
                                    >
                                        {saving ? 'Mentés...' : 'Mentés'}
                                    </button>
                                    {message && <span style={{ color: message.includes('Siker') ? 'green' : 'red' }}>{message}</span>}
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
