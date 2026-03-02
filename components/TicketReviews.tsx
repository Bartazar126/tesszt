'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n/context';
import styles from './TicketReviews.module.css';

interface Review {
    id: string;
    ticketSlug: string;
    author: string;
    rating: number;
    text: string;
    date: string;
}

export function TicketReviews({ slug }: { slug: string }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;
        fetch(`/api/reviews?slug=${slug}`)
            .then(res => res.json())
            .then(data => setReviews(data.reviews || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return null;
    }

    if (reviews.length === 0) {
        return null;
    }

    const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
    const { t } = useI18n();

    return (
        <section className={styles.reviewsSection} aria-label={t('reviews.title') || "Értékelések"}>
            <div className={styles.reviewsHeader}>
                <h2 className={styles.reviewsTitle}>{t('reviews.title') || 'Vendégértékelések'}</h2>
                <div className={styles.reviewsSummary}>
                    <span className={styles.starIcon}>★</span>
                    <span className={styles.averageScore}>{averageRating}</span>
                    <span className={styles.reviewCount}>/ 5 ({t('reviews.basedOn') ? t('reviews.basedOn').replace('{count}', reviews.length.toString()) : `${reviews.length} vélemény alapján`})</span>
                </div>
            </div>

            <div className={styles.reviewsGrid}>
                {reviews.map(review => (
                    <article key={review.id} className={styles.reviewCard}>
                        <div className={styles.reviewHeader}>
                            <h3 className={styles.reviewAuthor}>{review.author}</h3>
                            <span className={styles.reviewDate}>{review.date.split('T')[0]}</span>
                        </div>
                        <div className={styles.reviewRating}>
                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </div>
                        <p className={styles.reviewText}>{review.text}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
