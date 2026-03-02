import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
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

function saveAbout(data: Record<string, string>) {
    writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
    const about = loadAbout();
    return NextResponse.json({ about });
}

export async function POST(request: Request) {
    try {
        const { about } = await request.json();
        if (!about || typeof about !== 'object') {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        saveAbout(about);
        return NextResponse.json({ success: true, about });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to update about' }, { status: 500 });
    }
}
