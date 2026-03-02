'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/i18n/context';
import styles from './Footer.module.css';

export default function Footer() {
    const { t, locale } = useI18n();
    const [disclaimer, setDisclaimer] = useState<string>('');
    const [companyInfo, setCompanyInfo] = useState<Record<string, string>>({});

    useEffect(() => {
        fetch(`/api/disclaimer?lang=${locale}`)
            .then(res => res.json())
            .then(data => {
                if (data.text) {
                    setDisclaimer(data.text);
                }
            })
            .catch(err => console.error('Failed to fetch disclaimer:', err));

        fetch(`/api/company?lang=${locale}`)
            .then(res => res.json())
            .then(data => setCompanyInfo(data))
            .catch(err => console.error('Failed to fetch company info:', err));
    }, [locale]);

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.topSection}>
                    <div className={styles.links}>
                        <Link href="/privacy" className={styles.link}>{t('footer.privacy')}</Link>
                        <Link href="/terms" className={styles.link}>{t('footer.terms')}</Link>
                        <Link href="/about" className={styles.link}>{t('footer.about')}</Link>
                        <Link href="/cancellation" className={styles.link}>{t('footer.cancellation')}</Link>
                        <Link href="/disclaimer" className={styles.link}>{t('footer.disclaimer')}</Link>
                    </div>

                    <div className={styles.companyInfo}>
                        <p className={styles.companyTitle}><strong>{companyInfo.name || 'Operated by RandomTours s.r.o'}</strong></p>
                        <p>{companyInfo.address || 'Nam. Sv. Imricha 923/21, 943 01 Sturovo, Slovak Republic'}</p>
                        <p>{companyInfo.companyId || 'Company ID: 57028818'}</p>
                        <p>Support Email: <a href={`mailto:${companyInfo.email || '[EMAIL_ADDRESS]'}`} className={styles.link}>{companyInfo.email || '[EMAIL_ADDRESS]'}</a></p>
                        <p>Support Phone: {companyInfo.phone || '+177 5252 7578'}</p>
                    </div>
                    <div className={styles.paymentInfo}>
                        <h4 className={styles.paymentTitle}>{t('footer.securePayment')}</h4>
                        <p className={styles.paymentDesc}>{t('footer.paymentDesc')}</p>
                        <div className={styles.paymentIcons}>
                            <Image src="/visa.svg" alt="Visa" width={40} height={25} className={styles.paymentBadgeImg} />
                            <Image src="/mastercard.svg" alt="Mastercard" width={40} height={25} className={styles.paymentBadgeImg} />
                            <Image src="/amex.svg" alt="Amex" width={40} height={25} className={styles.paymentBadgeImg} />
                            <Image src="/apple-pay.svg" alt="Apple Pay" width={40} height={25} className={styles.paymentBadgeImg} />
                        </div>
                    </div>
                </div>

                {disclaimer && (
                    <div className={styles.disclaimerBox}>
                        <p className={styles.disclaimerText}>{disclaimer}</p>
                    </div>
                )}

                <div className={styles.bottomSection}>
                    <p className={styles.copyright}>{t('footer.copyright')}</p>
                </div>
            </div>
        </footer>
    );
}
