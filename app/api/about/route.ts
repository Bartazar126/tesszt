import { NextResponse } from 'next/server';
import aboutData from '@/data/about.json';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    const allAbout = aboutData as Record<string, string>;
    // Fallback to English if the requested language is not found
    const text = allAbout[lang] || allAbout['en'] || '';

    return NextResponse.json({ text });
}
