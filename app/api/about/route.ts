import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const DATA_PATH = path.join(process.cwd(), 'data', 'about.json');

function loadAbout() {
    try {
        if (!existsSync(DATA_PATH)) {
            return {};
        }
        const raw = readFileSync(DATA_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    const allAbout = loadAbout();
    // Fallback to English if the requested language is not found
    const text = allAbout[lang] || allAbout['en'] || '';

    return NextResponse.json({ text });
}
