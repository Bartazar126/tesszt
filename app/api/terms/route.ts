import { NextResponse } from 'next/server';
import termsData from '@/data/terms.json';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    const allTerms = termsData as Record<string, string>;
    // Fallback to English if the requested language is not found
    const text = allTerms[lang] || allTerms['en'] || '';

    return NextResponse.json({ text });
}
