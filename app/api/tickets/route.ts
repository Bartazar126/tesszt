import { NextResponse } from 'next/server';
import ticketsData from '@/data/tickets.json';
import reviewsData from '@/data/reviews.json';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const tickets: any[] = ticketsData;
        const reviews: any[] = reviewsData;

        const publicTickets = tickets.map((t: any) => {
            const ticketReviews = reviews.filter((r: any) => r.ticketSlug === t.slug);
            let averageRating = 0;
            if (ticketReviews.length > 0) {
                const total = ticketReviews.reduce((sum: number, r: any) => sum + r.rating, 0);
                averageRating = total / ticketReviews.length;
            }

            return {
                id: t.id,
                slug: t.slug,
                name: t.name,
                duration: t.duration,
                priceAdult: t.priceAdult,
                thumbnail: t.thumbnail,
                longDescription: t.longDescription,
                averageRating: averageRating.toFixed(1),
                reviewCount: ticketReviews.length
            };
        });

        return NextResponse.json({ tickets: publicTickets });
    } catch (error) {
        return NextResponse.json({ tickets: [] });
    }
}
