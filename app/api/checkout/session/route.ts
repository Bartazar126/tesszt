import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';

function getStripeKeys() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'stripe.json');
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            return { secretKey: data.secretKey || process.env.STRIPE_SECRET_KEY || '' };
        }
    } catch (e) {
        console.error('Error reading stripe keys:', e);
    }
    return { secretKey: process.env.STRIPE_SECRET_KEY || '' };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
        return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    try {
        const { secretKey } = getStripeKeys();
        const stripe = new Stripe(secretKey, {
            apiVersion: '2023-10-16' as any,
        });

        const session = await stripe.checkout.sessions.retrieve(sessionId);
        return NextResponse.json({ session });
    } catch (err: any) {
        console.error('Error retrieving session:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
