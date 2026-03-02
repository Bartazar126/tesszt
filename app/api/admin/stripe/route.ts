import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'stripe.json');

export async function GET() {
    try {
        if (fs.existsSync(dataFilePath)) {
            const fb = fs.readFileSync(dataFilePath, 'utf8');
            const data = JSON.parse(fb);
            return NextResponse.json({ ...data });
        }
        return NextResponse.json({ publishableKey: '', secretKey: '', webhookSecret: '' });
    } catch (error) {
        console.error('Error reading stripe keys', error);
        return NextResponse.json({ publishableKey: '', secretKey: '', webhookSecret: '' });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Create data directory if it doesn't exist
        const dir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(dataFilePath, JSON.stringify({
            publishableKey: body.publishableKey || '',
            secretKey: body.secretKey || '',
            webhookSecret: body.webhookSecret || '',
        }, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error writing stripe keys', error);
        return NextResponse.json({ error: 'Failed to save Stripe keys' }, { status: 500 });
    }
}
