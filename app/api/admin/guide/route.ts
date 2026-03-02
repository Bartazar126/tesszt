import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const DATA_PATH = path.join(process.cwd(), 'data', 'guide.json');

function loadGuide(): Record<string, string> {
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

function saveGuide(data: Record<string, string>) {
    writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
    return NextResponse.json({
        content: loadGuide()
    });
}

export async function POST(request: Request) {
    try {
        const { guideData } = await request.json();

        if (!guideData || typeof guideData !== 'object') {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        saveGuide(guideData);

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to update guide' }, { status: 500 });
    }
}
