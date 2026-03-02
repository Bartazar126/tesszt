'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/i18n/context';
import { getLocalizedText } from '@/i18n/utils';
import { LanguageSwitcher } from './LanguageSwitcher';
import styles from './Nav.module.css';


export function Nav() {
  const pathname = usePathname();
  const { t, locale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [tickets, setTickets] = useState<{ slug: string; name: string | Record<string, string> }[]>([
    { slug: 'louvre', name: '' },
    { slug: 'eiffel', name: '' },
    { slug: 'seine', name: '' }
  ]);

  useEffect(() => {
    fetch(`/api/tickets?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => setTickets(data.tickets || []))
      .catch(() => { });
  }, []);

  return (
    <nav className={styles.nav} aria-label="Main menu">
      <div className={styles.navInner}>
        <Link href="/" className={styles.logo} onClick={() => setIsOpen(false)}>
          ParisTickets
        </Link>

        <div className={styles.rightSide}>
          <div className={styles.langDesktop}>
            <LanguageSwitcher />
          </div>

          <button
            className={styles.hamburger}
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label="Toggle navigation"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>

        <ul className={`${styles.list} ${isOpen ? styles.listOpen : ''}`}>
          {tickets.map((ticket, index) => {
            const { slug, name } = ticket;
            const href = `/${slug}`;

            // Revert back to using fixed keys for the 3 main menu items
            const keys = ['nav.louvre', 'nav.eiffel', 'nav.seine'];
            const fixedKey = keys[index];
            const localizedName = fixedKey && t(fixedKey) !== fixedKey ? t(fixedKey) : (typeof name === 'object' && name !== null ? (name as Record<string, string>)[locale] || name['en'] : name);

            return (
              <li key={slug}>
                <Link
                  href={href}
                  className={pathname === href ? styles.active : styles.link}
                  onClick={() => setIsOpen(false)}
                >
                  {localizedName}
                </Link>
              </li>
            );
          })}
          <li className={styles.langMobile}>
            <LanguageSwitcher />
          </li>
        </ul>
      </div>
    </nav>
  );
}
