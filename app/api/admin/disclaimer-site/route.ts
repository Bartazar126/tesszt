import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const DATA_PATH = path.join(process.cwd(), 'data', 'disclaimer-site.json');

function loadDisclaimerSite() {
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

function saveDisclaimerSite(data: Record<string, string>) {
    writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
    const disclaimerSite = loadDisclaimerSite();
    return NextResponse.json({ disclaimerSite });
}

export async function POST(request: Request) {
    try {
        const { disclaimerSite } = await request.json();
        if (!disclaimerSite || typeof disclaimerSite !== 'object') {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        saveDisclaimerSite(disclaimerSite);
        return NextResponse.json({ success: true, disclaimerSite });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to update disclaimer site' }, { status: 500 });
    }
}
