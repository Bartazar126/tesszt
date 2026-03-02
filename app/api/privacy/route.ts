import { NextResponse } from 'next/server';
import privacyData from '@/data/privacy.json';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    const allPrivacies = privacyData as Record<string, string>;
    // Fallback to English if the requested language is not found
    const text = allPrivacies[lang] || allPrivacies['en'] || '';

    return NextResponse.json({ text });
}
