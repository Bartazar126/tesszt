'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n/context';
import styles from '../admin.module.css';
import { useEffect, useState } from 'react';

export default function AdminOrdersPage() {
  const { t } = useI18n();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const ordersPerPage = 20;

  useEffect(() => {
    fetch('/api/admin/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) {
          const sortedOrders = data.orders.sort((a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setOrders(sortedOrders);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.toLowerCase();
    return (
      (o.customer_name || '').toLowerCase().includes(term) ||
      (o.email || '').toLowerCase().includes(term) ||
      (o.name || '').toLowerCase().includes(term) ||
      (o.tel || '').toLowerCase().includes(term) ||
      (o.order_id || '').toLowerCase().includes(term) ||
      (o.id || '').toString().includes(term)
    );
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
            <Link href="/admin/orders" className={`${styles.menuItem} ${styles.menuItemActive}`}>{t('admin.orders') || 'Orders'}</Link>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
            <h1 className={styles.title} style={{ margin: 0 }}>{t('admin.orders')}</h1>

            <input
              type="text"
              placeholder="Rendelés keresése (név, email, telefon, jegy neve)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.input}
              style={{ maxWidth: '100%', padding: '12px 16px', fontSize: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div className={styles.card}>
            {loading ? (
              <p>Loading orders...</p>
            ) : orders.length === 0 ? (
              <p>No orders found yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
                {currentOrders.map((order) => (
                  <div key={order.id} style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}>
                    {/* Customer Info */}
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Customer Details</div>
                      <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>{order.customer_name || 'N/A'}</div>
                      <div style={{ color: '#475569', fontSize: '14px', marginTop: '2px' }}>{order.email}</div>
                      <div style={{ color: '#64748b', fontSize: '14px', marginTop: '2px' }}>{order.tel}</div>
                    </div>

                    {/* Ticket Info */}
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Ticket</div>
                      <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>{order.name}</div>
                      <div style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
                        {order.adult > 0 && <span>{order.adult} Adult{order.adult > 1 ? 's' : ''}</span>}
                        {order.adult > 0 && order.child > 0 && <span style={{ margin: '0 6px', color: '#cbd5e1' }}>|</span>}
                        {order.child > 0 && <span>{order.child} Child{order.child > 1 ? 'ren' : ''}</span>}
                      </div>
                    </div>

                    {/* Visit Info */}
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Visit Details</div>
                      <div style={{ color: '#0f172a', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#64748b' }}>Date:</span> <span style={{ fontWeight: '500' }}>{order.date || 'N/A'}</span>
                      </div>
                      <div style={{ color: '#0f172a', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <span style={{ color: '#64748b' }}>Time:</span> <span style={{ fontWeight: '500' }}>{order.time || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Order Meta */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', borderLeft: '1px solid #e2e8f0', paddingLeft: '20px' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Ordered on {new Date(order.created_at).toLocaleString()}</div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>€{order.price}</div>
                    </div>
                  </div>
                ))}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '30px' }}>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: currentPage === 1 ? '#f1f5f9' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: '#0f172a' }}
                    >
                      Previous
                    </button>
                    <span style={{ fontSize: '14px', color: '#475569' }}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: currentPage === totalPages ? '#f1f5f9' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: '#0f172a' }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <Link href="/" className={styles.back} style={{ display: 'inline-block', marginTop: '30px' }}>{t('nav.home')}</Link>
        </section>
      </div>
    </main>
  );
}

