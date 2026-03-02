import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseClient } from '@/lib/supabase';
import { getStripeKeys } from '@/lib/stripe';
import { headers } from 'next/headers';

export async function POST(req: Request) {
    const body = await req.text();
    const sig = headers().get('stripe-signature') as string;

    const { secretKey, webhookSecret } = getStripeKeys();

    if (!secretKey) {
        console.error('Stripe Secret Key is missing');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const stripe = new Stripe(secretKey, {
        apiVersion: '2023-10-16' as any,
    });

    let event;

    try {
        if (webhookSecret && sig) {
            event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
        } else {
            // Only allow unverified events if specifically testing or if no secret is set
            if (!webhookSecret) console.warn('Webhook secret not set, skipping signature verification');
            event = JSON.parse(body);
        }
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
        console.error('Supabase client failed to initialize');
        return NextResponse.json({ error: 'Database configuration error' }, { status: 500 });
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
