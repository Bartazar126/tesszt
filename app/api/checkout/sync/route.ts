import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { sessionId } = body;

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
        }

        const { secretKey } = getStripeKeys();
        const stripe = new Stripe(secretKey, {
            apiVersion: '2023-10-16' as any,
        });

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return NextResponse.json({ error: 'Order not paid yet' }, { status: 400 });
        }

        const metadata = session.metadata || {};

        const customerEmail = metadata.email || session.customer_details?.email;
        let existing: any[] = [];

        if (customerEmail) {
            const { data, error: searchError } = await supabase
                .from('Paristick')
                .select('id, created_at')
                .eq('name', metadata.name || 'Unknown Ticket')
                .eq('email', customerEmail)
                .eq('date', metadata.date || null)
                .order('created_at', { ascending: false })
                .limit(1);

            if (searchError) {
                console.error('Supabase search error:', searchError);
            }
            existing = data || [];
        }

        let isDuplicate = false;
        if (existing.length > 0 && existing[0].created_at) {
            const lastOrderDate = new Date(existing[0].created_at);
            const now = new Date();
            const diffMinutes = (now.getTime() - lastOrderDate.getTime()) / (1000 * 60);

            // If the exact same order was placed less than 1 minute ago, it's a duplicate sync
            if (diffMinutes < 1) {
                isDuplicate = true;
            }
        }

        if (isDuplicate) {
            console.log('Order already synced securely, skipping duplicate insert.');
            return NextResponse.json({ success: true, duplicate: true });
        }

        const { error } = await supabase
            .from('Paristick')
            .insert([
                {
                    name: metadata.name || 'Unknown Ticket',
                    customer_name: metadata.fullName || session.customer_details?.name || 'Unknown',
                    email: customerEmail || 'No Email',
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
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Server error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
