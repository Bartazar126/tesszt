import { NextResponse } from 'next/server';
import disclaimerData from '@/data/disclaimer.json';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    const allDisclaimers = disclaimerData as Record<string, string>;
    // Fallback to English if the requested language is not found
    const text = allDisclaimers[lang] || allDisclaimers['en'] || '';

    return NextResponse.json({ text });
}
