import Stripe from 'stripe';

export function getStripeKeys() {
    const secretKey = process.env.STRIPE_SECRET_KEY || '';
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    return { secretKey, publishableKey, webhookSecret };
}

export function getStripe() {
    const { secretKey } = getStripeKeys();
    if (!secretKey) {
        // Return null instead of throwing to prevent build/init crashes
        return null;
    }
    return new Stripe(secretKey, {
        apiVersion: '2023-10-16' as any,
    });
}
