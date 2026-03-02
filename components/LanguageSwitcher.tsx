'use client';

import { useI18n, type Locale } from '@/i18n/context';
import styles from './LanguageSwitcher.module.css';

const LOCALES: { code: Locale; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'de', label: 'DE' },
  { code: 'es', label: 'ES' },
  { code: 'it', label: 'IT' },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className={styles.wrapper} role="group" aria-label="Nyelv választó">
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          className={locale === code ? styles.active : styles.btn}
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
