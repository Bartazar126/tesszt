import { NextResponse } from 'next/server';
import disclaimerSiteData from '@/data/disclaimer-site.json';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    const allDisclaimerSite = disclaimerSiteData as Record<string, string>;
    // Fallback to English if not found
    const text = allDisclaimerSite[lang] || allDisclaimerSite['en'] || '';

    return NextResponse.json({ text });
}
