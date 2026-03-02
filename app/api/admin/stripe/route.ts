import { NextResponse } from 'next/server';
import { getStripeKeys } from '@/lib/stripe';
import fs from 'fs';
import path from 'path';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export async function GET() {
    try {
        const keys = getStripeKeys();
        
        // Return masked keys for security, but allow admin to verify configuration
        return NextResponse.json({
            publishableKey: keys.publishableKey,
            secretKey: keys.secretKey ? (keys.secretKey.startsWith('sk_') ? '••••••••' + keys.secretKey.slice(-4) : keys.secretKey) : '',
            webhookSecret: keys.webhookSecret ? (keys.webhookSecret.startsWith('whsec_') ? '••••••••' + keys.webhookSecret.slice(-4) : keys.webhookSecret) : '',
            isEnv: !!process.env.STRIPE_SECRET_KEY
        });
    } catch (error) {
        console.error('Error reading stripe keys', error);
        return NextResponse.json({ publishableKey: '', secretKey: '', webhookSecret: '' });
    }
}

export async function POST(request: Request) {
    // Check if we are in a read-only environment like Vercel
    if (process.env.VERCEL || IS_PRODUCTION) {
        return NextResponse.json({ 
            error: 'Environment is read-only. Please set environment variables: STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET.' 
        }, { status: 403 });
    }

    try {
        const body = await request.json();
        const dataFilePath = path.join(process.cwd(), 'data', 'stripe.json');
        
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
