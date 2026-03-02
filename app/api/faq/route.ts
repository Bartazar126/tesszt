import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { FAQItem } from '../admin/faq/route';

export const dynamic = 'force-dynamic';

const DATA_PATH = path.join(process.cwd(), 'data', 'faq.json');

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

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    const allFaqs = loadFAQs();

    // Map the array to only return text for the requested language
    const localizedFaqs = allFaqs.map(faq => ({
        id: faq.id,
        question: faq.question[lang] || faq.question['en'] || '',
        answer: faq.answer[lang] || faq.answer['en'] || ''
    }));

    return NextResponse.json({ faqs: localizedFaqs });
}
