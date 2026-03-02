import { NextResponse } from 'next/server';
import companyData from '@/data/company.json';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    try {
        const data = companyData as Record<string, any>;

        // Return the specified language, fallback to english, or an empty object if somehow not found
        const localizedCompany = data[lang] || data['en'] || {};

        return NextResponse.json(localizedCompany);
    } catch (error) {
        console.error('Failed to read company data:', error);
        return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
    }
}
