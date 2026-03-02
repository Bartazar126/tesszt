'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/context';
import styles from '../admin.module.css';

interface Review {
    id: string;
    ticketSlug: string;
    author: string;
    rating: number;
    text: string;
    date: string;
}

export default function AdminReviewsPage() {
    const { t } = useI18n();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [tickets, setTickets] = useState<{ slug: string, name: any }[]>([]);

    const [newReview, setNewReview] = useState({
        ticketSlug: '',
        author: '',
        rating: 5,
        text: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        window.location.href = '/admin/login';
    };

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/reviews');
            const data = await res.json();
            setReviews(data.reviews || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchTickets = async () => {
        try {
            // Fetch all tickets to populate the dropdown
            const res = await fetch('/api/tickets');
            const data = await res.json();
            setTickets(data.tickets || []);
            if (data.tickets && data.tickets.length > 0) {
                setNewReview(prev => ({ ...prev, ticketSlug: data.tickets[0].slug }));
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchTickets();
        fetchReviews();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Biztosan törölni szeretnéd ezt az értékelést?')) return;

        try {
            const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchReviews();
            } else {
                alert('Hiba törlés közben');
            }
        } catch (e) {
            alert('Hálózati hiba');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch('/api/admin/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newReview),
            });

            if (res.ok) {
                setNewReview({
                    ...newReview,
                    author: '',
                    text: '',
                    rating: 5
                });
                fetchReviews();
            } else {
                alert('Hiba történt a mentés során.');
            }
        } catch {
            alert('Hálózati hiba történt.');
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
                        <Link href="/admin/stripe" className={styles.menuItem}>Stripe API</Link>
                        <Link href="/admin/reviews" className={`${styles.menuItem} ${styles.menuItemActive}`}>Reviews</Link>
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
                    <h1 className={styles.title}>Értékelések (Reviews) Kezelése</h1>

                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Új értékelés hozzáadása</h2>

                        <form onSubmit={handleSave} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Jegy (Ticket)</label>
                                <select
                                    className={styles.input}
                                    style={{ width: '100%' }}
                                    value={newReview.ticketSlug}
                                    onChange={e => setNewReview({ ...newReview, ticketSlug: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Válassz jegyet...</option>
                                    {tickets.map(tkt => (
                                        <option key={tkt.slug} value={tkt.slug}>
                                            {typeof tkt.name === 'object' ? tkt.name['en'] || tkt.slug : tkt.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Író neve</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    style={{ width: '100%' }}
                                    required
                                    value={newReview.author}
                                    onChange={e => setNewReview({ ...newReview, author: e.target.value })}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Értékelés (1-5)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    step="1"
                                    className={styles.input}
                                    style={{ width: '100%' }}
                                    required
                                    value={newReview.rating}
                                    onChange={e => setNewReview({ ...newReview, rating: parseInt(e.target.value, 10) })}
                                />
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Értékelés szövege</label>
                                <textarea
                                    className={styles.input}
                                    style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                                    required
                                    value={newReview.text}
                                    onChange={e => setNewReview({ ...newReview, text: e.target.value })}
                                />
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <button type="submit" disabled={saving || !newReview.ticketSlug} className={styles.editBtn} style={{ background: '#111', color: '#fff', border: 'none' }}>
                                    {saving ? 'Hozzáadás...' : 'Értékelés Hozzáadása'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Létező értékelések</h2>

                        {loading ? (
                            <p>Betöltés...</p>
                        ) : reviews.length === 0 ? (
                            <p style={{ color: '#666' }}>Még nincsenek értékelések.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {reviews.map(review => (
                                    <div key={review.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                                <strong style={{ fontSize: '1.1rem' }}>{review.author}</strong>
                                                <span style={{ color: '#fbbf24', fontSize: '1.1rem' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({review.date.split('T')[0]})</span>
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '8px' }}>
                                                Jegy: <strong>{review.ticketSlug}</strong>
                                            </div>
                                            <p style={{ margin: 0, color: '#1e293b' }}>{review.text}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            style={{ color: '#ef4444', background: '#fee2e2', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Törlés
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
