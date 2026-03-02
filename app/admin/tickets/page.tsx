'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/i18n/context';
import { getLocalizedText } from '@/i18n/utils';
import styles from '../admin.module.css';

interface TicketData {
  id: string;
  slug: string;
  name: string | Record<string, string>;
  priceAdult: number;
  priceChild: number;
  stock: number;
}

export default function AdminTicketsPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/tickets')
      .then((res) => res.json())
      .then((data) => setTickets(data.tickets ?? []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

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
            <Link href="/admin/tickets" className={`${styles.menuItem} ${styles.menuItemActive}`}>Manage tickets</Link>
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
          <h1 className={styles.title}>Manage tickets</h1>
          {loading ? (
            <p className={styles.loading}>Betöltés…</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Jegy</th>
                    <th>Felnőtt (€)</th>
                    <th>Gyerek (€)</th>
                    <th>Készlet</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>{getLocalizedText(ticket.name, locale)}</td>
                      <td>€{ticket.priceAdult}</td>
                      <td>€{ticket.priceChild}</td>
                      <td>{ticket.stock}</td>
                      <td>
                        <button
                          type="button"
                          className={styles.editBtn}
                          onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                        >
                          Szerkesztés
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Link href="/" className={styles.back}>{t('nav.home')}</Link>
        </section>
      </div>
    </main>
  );
}

