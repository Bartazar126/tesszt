import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';

export function getStripeKeys() {
    let secretKey = process.env.STRIPE_SECRET_KEY || '';
    let publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
    let webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    if (!secretKey || !publishableKey) {
        try {
            const filePath = path.join(process.cwd(), 'data', 'stripe.json');
            if (fs.existsSync(filePath)) {
                const fileContent = fs.readFileSync(filePath, 'utf8');
                if (fileContent.trim()) {
                    const data = JSON.parse(fileContent);
                    if (!secretKey && data.secretKey && !data.secretKey.startsWith('REPLACE')) secretKey = data.secretKey;
                    if (!publishableKey && data.publishableKey && !data.publishableKey.startsWith('REPLACE')) publishableKey = data.publishableKey;
                    if (!webhookSecret && data.webhookSecret && !data.webhookSecret.startsWith('REPLACE')) webhookSecret = data.webhookSecret;
                }
            }
        } catch (e) {
            // Ignore file errors
        }
    }

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
