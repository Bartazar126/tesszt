import { NextResponse } from 'next/server';
import reviewsData from '@/data/reviews.json';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get('slug');

        const allReviews = reviewsData as any[];

        if (slug) {
            const filteredReviews = allReviews.filter((r: any) => r.ticketSlug === slug);
            return NextResponse.json({ reviews: filteredReviews });
        }

        return NextResponse.json({ reviews: allReviews });
    } catch (err) {
        return NextResponse.json({ reviews: [] });
    }
}
