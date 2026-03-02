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

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { slug, title, date, time, adults, children, priceAdult, priceChild, total, customer } = body;

        const { secretKey } = getStripeKeys();

        if (!secretKey) {
            console.error('Missing Stripe Secret Key');
            return NextResponse.json({ error: 'Stripe is not configured on the server.' }, { status: 500 });
        }

        const stripe = new Stripe(secretKey, {
            apiVersion: '2023-10-16' as any,
        });

        const lineItems = [];
        const description = `Date: ${date}, Time: ${time} | ${customer.fullName}`;

        if (adults > 0) {
            lineItems.push({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: `${title} - Adult Ticket`,
                        description,
                    },
                    unit_amount: priceAdult * 100, // Stripe expects cents
                },
                quantity: adults,
            });
        }

        if (children > 0) {
            lineItems.push({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: `${title} - Child Ticket`,
                        description,
                    },
                    unit_amount: priceChild * 100,
                },
                quantity: children,
            });
        }

        if (lineItems.length === 0) {
            return NextResponse.json({ error: 'No tickets selected.' }, { status: 400 });
        }

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${slug}`,
            metadata: {
                name: title,
                date,
                dateObj: JSON.stringify(date),
                time,
                adult: adults.toString(),
                child: children.toString(),
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone,
                price: total.toString()
            },
            customer_email: customer.email,
        });

        return NextResponse.json({ id: session.id, url: session.url });
    } catch (err: any) {
        console.error('Stripe Checkout Error:', err);
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}
