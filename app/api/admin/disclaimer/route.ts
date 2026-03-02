import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const DATA_PATH = path.join(process.cwd(), 'data', 'disclaimer.json');

function loadDisclaimer() {
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

function saveDisclaimer(data: Record<string, string>) {
    writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
    const disclaimer = loadDisclaimer();
    return NextResponse.json({ disclaimer });
}

export async function POST(request: Request) {
    try {
        const { disclaimer } = await request.json();
        if (!disclaimer || typeof disclaimer !== 'object') {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        saveDisclaimer(disclaimer);
        return NextResponse.json({ success: true, disclaimer });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to update disclaimer' }, { status: 500 });
    }
}
