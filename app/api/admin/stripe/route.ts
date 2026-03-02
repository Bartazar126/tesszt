import { NextResponse } from 'next/server';
import { getStripeKeys } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

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
    return NextResponse.json({ 
        error: 'Environment is read-only. Please set environment variables: STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET.' 
    }, { status: 403 });
}
