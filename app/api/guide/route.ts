import { NextResponse } from 'next/server';
import guideData from '@/data/guide.json';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    const translations = guideData as Record<string, string>;
    const text = translations[lang] || translations['en'] || '';

    return NextResponse.json({ text });
}
