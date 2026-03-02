'use client';

import Link from 'next/link';
import { Nav } from '@/components/Nav';
import styles from '../success/success.module.css';

export default function CancelPage() {
    return (
        <>
            <Nav />
            <main className="page-main">
                <div className={styles.container}>
                    <div className={styles.card}>
                        <div className={`${styles.iconWrap} ${styles.iconWrapCancel}`}>
                            ×
                        </div>
                        <h1 className={styles.title}>Payment Cancelled</h1>
                        <p className={styles.text}>
                            Your payment process was cancelled and no charges were made to your card.
                        </p>
                        <p className={styles.text}>
                            If you encountered an issue or changed your mind, you can try booking again anytime.
                        </p>

                        <Link href="/" className={styles.homeBtn}>
                            Return to Home
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}
