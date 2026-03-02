import { NextResponse } from 'next/server';
import faqData from '@/data/faq.json';
import { FAQItem } from '../admin/faq/route';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    const allFaqs = faqData as FAQItem[];

    // Map the array to only return text for the requested language
    const localizedFaqs = allFaqs.map(faq => ({
        id: faq.id,
        question: faq.question[lang] || faq.question['en'] || '',
        answer: faq.answer[lang] || faq.answer['en'] || ''
    }));

    return NextResponse.json({ faqs: localizedFaqs });
}
