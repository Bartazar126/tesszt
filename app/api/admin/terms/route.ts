import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const DATA_PATH = path.join(process.cwd(), 'data', 'terms.json');

function loadTerms() {
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

function saveTerms(data: Record<string, string>) {
    writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
    const terms = loadTerms();
    return NextResponse.json({ terms });
}

export async function POST(request: Request) {
    try {
        const { terms } = await request.json();
        if (!terms || typeof terms !== 'object') {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        saveTerms(terms);
        return NextResponse.json({ success: true, terms });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to update terms' }, { status: 500 });
    }
}
