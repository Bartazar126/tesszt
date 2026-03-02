'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { useI18n } from '@/i18n/context';
import { TicketDetail } from '@/components/TicketDetail';
import { TicketReviews } from '@/components/TicketReviews';
import { getLocalizedText } from '@/i18n/utils';

export default function DynamicTicketPage() {
    const params = useParams<{ slug: string }>();
    const slug = params?.slug ?? '';
    const { t, locale } = useI18n();
    const [ticket, setTicket] = useState<any>(null);

    useEffect(() => {
        if (!slug) return;
        fetch(`/api/tickets/${slug}?t=${Date.now()}`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => setTicket(data));
    }, [slug]);

    return (
        <>
            <Nav />
            <main className="page-main">
                <TicketDetail
                    title={ticket?.name ? getLocalizedText(ticket.name, locale) : t(`${slug}.title`)}
                    description={ticket?.longDescription ? getLocalizedText(ticket.longDescription, locale) : t(`${slug}.description`)}
                    duration={ticket?.duration ? getLocalizedText(ticket.duration, locale) : t(`${slug}.duration`)}
                    priceAdult={ticket?.priceAdult ?? 0}
                    priceChild={ticket?.priceChild ?? 0}
                    slug={slug}
                    averageRating={ticket?.averageRating}
                    reviewCount={ticket?.reviewCount}
                />
                <TicketReviews slug={slug} />
            </main>
        </>
    );
}
