import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'data', 'company.json');

export async function GET() {
    try {
        const fileContents = await fs.readFile(dataFile, 'utf8');
        const data = JSON.parse(fileContents);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Failed to read company data:', error);
        return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        await fs.writeFile(dataFile, JSON.stringify(data, null, 2), 'utf8');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to update company data:', error);
        return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
    }
}
