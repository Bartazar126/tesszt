import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const DATA_PATH = path.join(process.cwd(), 'data', 'privacy.json');

function loadPrivacy() {
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

function savePrivacy(data: Record<string, string>) {
    writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
    const privacy = loadPrivacy();
    return NextResponse.json({ privacy });
}

export async function POST(request: Request) {
    try {
        const { privacy } = await request.json();
        if (!privacy || typeof privacy !== 'object') {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        savePrivacy(privacy);
        return NextResponse.json({ success: true, privacy });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to update privacy policy' }, { status: 500 });
    }
}
