'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/context';
import styles from './admin.module.css';

interface TicketData {
  id: string;
  slug: string;
  name: string;
  priceAdult: number;
  priceChild: number;
  stock: number;
}

export default function AdminPage() {
  const { t } = useI18n();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  useEffect(() => {
    fetch('/api/admin/tickets')
      .then((res) => res.json())
      .then((data) => setTickets(data.tickets ?? []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  const totalStock = tickets.reduce((sum, ticket) => sum + (ticket.stock ?? 0), 0);

  return (
    <main className={styles.main}>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTitle}>Admin</div>
          <nav className={styles.menu}>
            <Link href="/admin" className={`${styles.menuItem} ${styles.menuItemActive}`}>Dashboard</Link>
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
            <Link href="/admin/company" className={styles.menuItem}>{t('admin.company') || 'Company'}</Link>
            <Link href="/admin/guide" className={styles.menuItem}>Guide</Link>
            <button onClick={handleLogout} className={styles.menuItem} style={{ textAlign: 'left', cursor: 'pointer', background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', width: '100%', padding: '10px 15px', marginTop: '10px' }}>Logout</button>
          </nav>
        </aside>

        <section className={styles.content}>
          <h1 className={styles.title}>Dashboard</h1>

          <div className={styles.dashboardGrid}>
            <div className={styles.card}>
              <div className={styles.cardLabel}>Aktív jegyek</div>
              <div className={styles.cardValue}>{tickets.length}</div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardLabel}>Összes készlet</div>
              <div className={styles.cardValue}>{totalStock}</div>
            </div>
          </div>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Gyors műveletek</h2>
            {loading ? (
              <p className={styles.loading}>Betöltés…</p>
            ) : (
              <div className={styles.quickActions}>
                <a href="/admin/tickets" className={styles.editBtn}>Manage tickets</a>
                <a href="/admin/orders" className={styles.editBtn}>{t('admin.orders')}</a>
              </div>
            )}
          </section>

          <Link href="/" className={styles.back}>{t('nav.home')}</Link>
        </section>
      </div>
    </main>
  );
}
