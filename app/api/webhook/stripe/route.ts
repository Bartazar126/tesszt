import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import fs from 'fs';
import path from 'path';

function getStripeKeys() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'stripe.json');
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            return {
                secretKey: data.secretKey || process.env.STRIPE_SECRET_KEY || '',
                webhookSecret: data.webhookSecret || process.env.STRIPE_WEBHOOK_SECRET || ''
            };
        }
    } catch (e) {
        console.error('Error reading stripe keys:', e);
    }
    return {
        secretKey: process.env.STRIPE_SECRET_KEY || '',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
    };
}

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
    const body = await req.text();
    const sig = headers().get('stripe-signature') as string;

    const { secretKey, webhookSecret } = getStripeKeys();
    const stripe = new Stripe(secretKey, {
        apiVersion: '2023-10-16' as any,
    });

    let event;

    try {
        if (webhookSecret) {
            event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
        } else {
            // Bypass signature verification if no secret is configured (for direct testing without CLI)
            event = JSON.parse(body);
        }
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as Stripe.Checkout.Session;
            console.log(`Payment successful for session ${session.id}`);

            const metadata = session.metadata || {};

            try {
                const customerEmail = metadata.email || session.customer_details?.email || 'No Email';

                // Duplicate check
                const { data, error: searchError } = await supabase
                    .from('Paristick')
                    .select('id, created_at')
                    .eq('name', metadata.name || 'Unknown Ticket')
                    .eq('email', customerEmail)
                    .eq('date', metadata.date || null)
                    .order('created_at', { ascending: false })
                    .limit(1);

                let isDuplicate = false;
                if (data && data.length > 0 && data[0].created_at) {
                    const lastOrderDate = new Date(data[0].created_at);
                    const now = new Date();
                    const diffMinutes = (now.getTime() - lastOrderDate.getTime()) / (1000 * 60);

                    // If the exact same order was placed less than 1 minute ago, it's a duplicate sync
                    if (diffMinutes < 1) {
                        isDuplicate = true;
                    }
                }

                if (isDuplicate) {
                    console.log('Webhook: Order already synced securely, skipping duplicate insert.');
                    break;
                }

                const { error } = await supabase
                    .from('Paristick')
                    .insert([
                        {
                            name: metadata.name || 'Unknown Ticket',
                            customer_name: metadata.fullName || session.customer_details?.name || 'Unknown',
                            email: customerEmail,
                            adult: parseInt(metadata.adult || '0', 10),
                            child: parseInt(metadata.child || '0', 10),
                            date: metadata.date || null,
                            time: metadata.time || null,
                            tel: metadata.phone || '',
                            price: parseInt(metadata.price || '0', 10)
                        }
                    ]);

                if (error) {
                    console.error('Failed to insert into Supabase:', error);
                } else {
                    console.log('Successfully inserted order into Paristick table');
                }
            } catch (dbErr) {
                console.error('Supabase Error:', dbErr);
            }

            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
