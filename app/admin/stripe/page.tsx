'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/context';
import styles from '../admin.module.css';

export default function AdminStripePage() {
    const { t } = useI18n();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const [keys, setKeys] = useState({
        publishableKey: '',
        secretKey: '',
        webhookSecret: ''
    });

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        window.location.href = '/admin/login';
    };

    useEffect(() => {
        fetch('/api/admin/stripe')
            .then((res) => res.json())
            .then((data) => {
                if (data) {
                    setKeys({
                        publishableKey: data.publishableKey || '',
                        secretKey: data.secretKey || '',
                        webhookSecret: data.webhookSecret || ''
                    });
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeys((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const res = await fetch('/api/admin/stripe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(keys),
            });

            if (res.ok) {
                setMessage('Sikeresen mentve!');
            } else {
                setMessage('Hiba történt a mentés során.');
            }
        } catch {
            setMessage('Hálózati hiba történt.');
        } finally {
            setSaving(false);
        }
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
                        <Link href="/admin/stripe" className={`${styles.menuItem} ${styles.menuItemActive}`}>Stripe API</Link>
                        <Link href="/admin/reviews" className={styles.menuItem}>Reviews</Link>
                        <Link href="/admin/terms" className={styles.menuItem}>{t('admin.terms') || 'Terms'}</Link>
                        <Link href="/admin/about" className={styles.menuItem}>{t('admin.about') || 'About Us'}</Link>
                        <Link href="/admin/privacy" className={styles.menuItem}>{t('admin.privacy') || 'Privacy'}</Link>
                        <Link href="/admin/faq" className={styles.menuItem}>{t('admin.faq') || 'FAQ'}</Link>
                        <Link href="/admin/disclaimer-site" className={styles.menuItem}>{t('admin.disclaimerSite') || 'Disclaimer Site'}</Link>
                        <Link href="/admin/disclaimer" className={styles.menuItem}>{t('admin.disclaimer') || 'Disclaimer'}</Link>
                        <Link href="/admin/company" className={styles.menuItem}>{t('admin.company') || 'Company'}</Link>
                        <Link href="/admin/guide" className={styles.menuItem}>Guide</Link>
                        <button onClick={handleLogout} className={styles.menuItem} style={{ textAlign: 'left', cursor: 'pointer', background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', width: '100%', padding: '10px 15px', marginTop: '10px' }}>Logout</button>
                    </nav>
                </aside>

                <section className={styles.content}>
                    <h1 className={styles.title}>Stripe API Beállítások</h1>

                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
                        {loading ? (
                            <p className={styles.loading}>Betöltés…</p>
                        ) : (
                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                    Stripe API Kulcsok (Dashboard &gt; Developers &gt; API keys)
                                </p>

                                <div>
                                    <label htmlFor="publishableKey" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                        Publishable Key (pk_test_... vagy pk_live_...)
                                    </label>
                                    <input
                                        id="publishableKey"
                                        name="publishableKey"
                                        type="text"
                                        required
                                        value={keys.publishableKey}
                                        onChange={handleChange}
                                        className={styles.input}
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="secretKey" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                        Secret Key (sk_test_... vagy sk_live_...)
                                    </label>
                                    <input
                                        id="secretKey"
                                        name="secretKey"
                                        type="text"
                                        required
                                        value={keys.secretKey}
                                        onChange={handleChange}
                                        className={styles.input}
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="webhookSecret" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                        Webhook Secret (whsec_...)
                                    </label>
                                    <input
                                        id="webhookSecret"
                                        name="webhookSecret"
                                        type="text"
                                        value={keys.webhookSecret}
                                        onChange={handleChange}
                                        className={styles.input}
                                        style={{ width: '100%' }}
                                        placeholder="Sikeres fizetések webhook naplózásához"
                                    />
                                </div>

                                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className={styles.editBtn}
                                        style={{ background: '#111', color: '#fff', border: 'none' }}
                                    >
                                        {saving ? 'Mentés...' : 'Mentés'}
                                    </button>
                                    {message && <span style={{ color: message.includes('Siker') ? 'green' : 'red', fontWeight: 'bold' }}>{message}</span>}
                                </div>
                            </form>
                        )}
                    </div>

                    <Link href="/admin" className={styles.back}>Vissza a Dashboardra</Link>
                </section>
            </div>
        </main>
    );
}
