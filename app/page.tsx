'use client';

import React from 'react';

import Image from 'next/image';
import { Nav } from '@/components/Nav';
import { TicketCards } from '@/components/TicketCards';
import { FAQAccordion } from '@/components/FAQAccordion';
import { useI18n } from '@/i18n/context';
import { getLocalizedText } from '@/i18n/utils';
import styles from './page.module.css';

interface PublicTicket {
  id: string;
  slug: string;
  name: string | Record<string, string>;
  duration: string | Record<string, string>;
  priceAdult: number;
  thumbnail?: string;
}

export default function HomePage() {
  const { t, locale } = useI18n();
  const [tickets, setTickets] = React.useState<PublicTicket[]>([]);
  const [faqs, setFaqs] = React.useState<any[]>([]);
  const [guide, setGuide] = React.useState<string>('');

  React.useEffect(() => {
    fetch('/api/tickets')
      .then(res => res.json())
      .then(data => setTickets(data.tickets || []))
      .catch(() => { });

    fetch(`/api/faq?lang=${locale}`)
      .then(res => res.json())
      .then(data => setFaqs(data.faqs || []))
      .catch(() => { });

    fetch(`/api/guide?lang=${locale}`)
      .then(res => res.json())
      .then(data => {
        if (data.text) setGuide(data.text);
      })
      .catch(() => { });
  }, [locale]);

  return (
    <>
      <Nav />
      <main className={styles.main}>
        <section className={styles.banner}>
          <div className={styles.bannerInner}>
            <div className={styles.bannerBg}>
              <Image
                src="/louvreback.jpg"
                alt="Louvre Museum background"
                fill
                priority
                sizes="100vw"
                className={styles.bannerImage}
              />
              <div className={styles.bannerOverlay} />
            </div>
            <div className={styles.bannerContent}>
              <div className={styles.bannerText}>
                <span className={styles.heroBadge}>{t('home.badge')}</span>
                <h1 className={styles.heroTitle}>{t('hero.title')}</h1>
                <p className={styles.heroSubtitle}>{t('hero.subtitle')}</p>
                <div className={styles.heroMeta}>
                  <span>{t('home.delivery')}</span>
                  <span>{t('home.support')}</span>
                  <span>{t('home.skip')}</span>
                  <span>{t('home.secure')}</span>
                </div>
              </div>
              <aside className={styles.selector} aria-label={t('home.selectTour')}>
                <h2 className={styles.selectorTitle}>{t('home.selectTour')}</h2>
                <p className={styles.selectorSubtitle}>{t('home.selectDesc')}</p>
                <div className={styles.selectorList}>
                  {tickets.map((item) => (
                    <a
                      key={item.slug}
                      href={`#${item.slug}`}
                      className={styles.selectorItem}
                    >
                      {item.thumbnail && (
                        <div className={styles.selectorThumbnailWrap}>
                          <Image src={item.thumbnail} alt={getLocalizedText(item.name, locale)} fill className={styles.selectorThumbnail} />
                        </div>
                      )}
                      <div className={styles.selectorInfo}>
                        <div className={styles.selectorName}>{getLocalizedText(item.name, locale)}</div>
                        <div className={styles.selectorMeta}>{t('home.approx')} {getLocalizedText(item.duration, locale)}</div>
                      </div>
                      <div className={styles.selectorPrice}>{t('tickets.from')} €{item.priceAdult}</div>
                    </a>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className={styles.toursSection} aria-label={t('home.selectTour')}>
          <h2 className={styles.toursTitle}>{t('home.selectTour')}</h2>
          <p className={styles.toursSubtitle}>
            {t('home.featuresDesc')}
          </p>
          <TicketCards />
        </section>

        <section className={styles.features} aria-label="Ticket highlights">
          <h2 className={styles.featuresTitle}>{t('home.whyBook')}</h2>
          <div className={styles.featuresGrid}>
            <article className={styles.featureCard}>
              <img src="/shield.svg" alt="Shield Icon" width="32" height="32" className={styles.featureIcon} />
              <h3>{t('home.feat1Title')}</h3>
              <p>{t('home.feat1Desc')}</p>
            </article>
            <article className={styles.featureCard}>
              <img src="/lightning.svg" alt="Lightning Icon" width="32" height="32" className={styles.featureIcon} />
              <h3>{t('home.feat2Title')}</h3>
              <p>{t('home.feat2Desc')}</p>
            </article>
            <article className={styles.featureCard}>
              <img src="/iphone.svg" alt="iPhone Icon" width="32" height="32" className={styles.featureIcon} />
              <h3>{t('home.feat3Title')}</h3>
              <p>{t('home.feat3Desc')}</p>
            </article>
            <article className={styles.featureCard}>
              <img src="/support.svg" alt="Support Icon" width="32" height="32" className={styles.featureIcon} />
              <h3>{t('home.feat4Title')}</h3>
              <p>{t('home.feat4Desc')}</p>
            </article>
          </div>
        </section>

        {faqs && faqs.length > 0 && (
          <section className={styles.faqSection} aria-label={t('home.faqTitle')}>
            <h2 className={styles.faqTitle}>{t('home.faqTitle')}</h2>
            <FAQAccordion faqs={faqs} />
          </section>
        )}

        {guide && (
          <section className={styles.guideSection} aria-label="Guide to Louvre Museum Visits">
            <div
              className={styles.guideContent}
              dangerouslySetInnerHTML={{ __html: guide.replace(/&nbsp;/g, ' ') }}
            />
          </section>
        )}
      </main>
    </>
  );
}
