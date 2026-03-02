import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const DATA_PATH = path.join(process.cwd(), 'data', 'tickets.json');
const REVIEWS_PATH = path.join(process.cwd(), 'data', 'reviews.json');

export async function GET() {
    try {
        const raw = readFileSync(DATA_PATH, 'utf-8');
        const tickets: any[] = JSON.parse(raw);

        let reviews: any[] = [];
        try {
            reviews = JSON.parse(readFileSync(REVIEWS_PATH, 'utf-8'));
        } catch (e) {
            // Ignore if reviews file doesn't exist or is invalid
        }

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
