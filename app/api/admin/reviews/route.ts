import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const DATA_PATH = path.join(process.cwd(), 'data', 'reviews.json');

function loadReviews() {
    try {
        if (!existsSync(DATA_PATH)) {
            writeFileSync(DATA_PATH, '[]', 'utf-8');
            return [];
        }
        const raw = readFileSync(DATA_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function saveReviews(reviews: any[]) {
    writeFileSync(DATA_PATH, JSON.stringify(reviews, null, 2), 'utf-8');
}

export async function GET() {
    const reviews = loadReviews();
    return NextResponse.json({ reviews });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const reviews = loadReviews();

        const newReview = {
            id: Date.now().toString(),
            ticketSlug: body.ticketSlug,
            author: body.author,
            rating: parseInt(body.rating, 10),
            text: body.text,
            date: body.date || new Date().toISOString()
        };

        reviews.push(newReview);
        saveReviews(reviews);

        return NextResponse.json({ review: newReview });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing review id' }, { status: 400 });
        }

        let reviews = loadReviews();
        const initialLength = reviews.length;
        reviews = reviews.filter((r: any) => r.id !== id);

        if (reviews.length === initialLength) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        saveReviews(reviews);

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
    }
}
