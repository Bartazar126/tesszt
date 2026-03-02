import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const DATA_PATH = path.join(process.cwd(), 'data', 'faq.json');

export interface FAQItem {
    id: string;
    question: Record<string, string>;
    answer: Record<string, string>;
}

function loadFAQs(): FAQItem[] {
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

function saveFAQs(data: FAQItem[]) {
    writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
    const faqs = loadFAQs();
    return NextResponse.json({ faqs });
}

export async function POST(request: Request) {
    try {
        const { faqs } = await request.json();
        if (!Array.isArray(faqs)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        saveFAQs(faqs);
        return NextResponse.json({ success: true, faqs });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to update FAQs' }, { status: 500 });
    }
}
