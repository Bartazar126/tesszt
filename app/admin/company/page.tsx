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

export default function AdminCompanyPage() {
    const { t } = useI18n();
    const [companyData, setCompanyData] = useState<Record<string, Record<string, string>>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        fetch('/api/admin/company')
            .then((res) => res.json())
            .then((data) => setCompanyData(data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSaveMessage('');
        try {
            const res = await fetch('/api/admin/company', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(companyData),
            });
            if (res.ok) {
                setSaveMessage('Mentve!');
            } else {
                setSaveMessage('Hiba történt a mentés során.');
            }
        } catch (err) {
            console.error(err);
            setSaveMessage('Hálózati hiba.');
        } finally {
            setSaving(false);
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };

    const updateField = (lang: string, field: string, value: string) => {
        setCompanyData((prev) => ({
            ...prev,
            [lang]: {
                ...(prev[lang] || {}),
                [field]: value
            }
        }));
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
            <Link href="/admin/disclaimer" className={styles.menuItem}>{t('admin.disclaimer') || 'Disclaimer'}</Link>
            <Link href="/admin/company" className={`${styles.menuItem} ${styles.menuItemActive}`}>{t('admin.company') || 'Company'}</Link>
            <Link href="/admin/guide" className={styles.menuItem}>Guide</Link>
            <button onClick={handleLogout} className={styles.menuItem} style={{ textAlign: 'left', cursor: 'pointer', background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', width: '100%', padding: '10px 15px', marginTop: '10px' }}>Logout</button>
          </nav>
                </aside>

                <section className={styles.content}>
                    <h1 className={styles.title}>{t('admin.company') || 'Company'}</h1>

                    {loading ? (
                        <p>Betöltés...</p>
                    ) : (
                        <div className={styles.ordersList} style={{ display: 'flex', flexDirection: 'column', gap: '30px', background: 'transparent', border: 'none', padding: 0 }}>
                            {LANGUAGES.map((lang) => (
                                <div key={lang.code} style={{ background: 'var(--color-surface)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(15, 23, 42, 0.08)' }}>
                                    <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', fontWeight: 600 }}>
                                        {lang.label} ({lang.code})
                                    </h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Cégnév (Name)</label>
                                            <input
                                                type="text"
                                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid rgba(15, 23, 42, 0.15)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none' }}
                                                value={companyData[lang.code]?.name || ''}
                                                onChange={(e) => updateField(lang.code, 'name', e.target.value)}
                                            />
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Cím (Address)</label>
                                            <input
                                                type="text"
                                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid rgba(15, 23, 42, 0.15)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none' }}
                                                value={companyData[lang.code]?.address || ''}
                                                onChange={(e) => updateField(lang.code, 'address', e.target.value)}
                                            />
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Cégjegyzékszám (Company ID)</label>
                                            <input
                                                type="text"
                                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid rgba(15, 23, 42, 0.15)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none' }}
                                                value={companyData[lang.code]?.companyId || ''}
                                                onChange={(e) => updateField(lang.code, 'companyId', e.target.value)}
                                            />
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Email címe (Support Email)</label>
                                            <input
                                                type="email"
                                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid rgba(15, 23, 42, 0.15)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none' }}
                                                value={companyData[lang.code]?.email || ''}
                                                onChange={(e) => updateField(lang.code, 'email', e.target.value)}
                                            />
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Telefonszám (Support Phone)</label>
                                            <input
                                                type="text"
                                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid rgba(15, 23, 42, 0.15)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none' }}
                                                value={companyData[lang.code]?.phone || ''}
                                                onChange={(e) => updateField(lang.code, 'phone', e.target.value)}
                                            />
                                        </div>
                                    </div>
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
                                {saveMessage && <span style={{ color: saveMessage.includes('Mentve') || saveMessage.includes('Siker') ? 'green' : 'red' }}>{saveMessage}</span>}
                            </div>
                        </div>
                    )}

                    <Link href="/" className={styles.back} style={{ marginTop: '24px', display: 'inline-block' }}>{t('nav.home')}</Link>
                </section>
            </div>
        </main>
    );
}
