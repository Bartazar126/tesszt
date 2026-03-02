import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const DATA_PATH = path.join(process.cwd(), 'data', 'reviews.json');

function loadReviews() {
    try {
        if (!existsSync(DATA_PATH)) {
            return [];
        }
        const raw = readFileSync(DATA_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get('slug');

        const allReviews = loadReviews();

        if (slug) {
            const filteredReviews = allReviews.filter((r: any) => r.ticketSlug === slug);
            return NextResponse.json({ reviews: filteredReviews });
        }

        return NextResponse.json({ reviews: allReviews });
    } catch (err) {
        return NextResponse.json({ reviews: [] });
    }
}
