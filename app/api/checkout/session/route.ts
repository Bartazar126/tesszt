import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeKeys } from '@/lib/stripe';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
        return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    try {
        const { secretKey } = getStripeKeys();
        
        if (!secretKey) {
            console.error('Stripe Secret Key is missing');
            return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
        }

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
