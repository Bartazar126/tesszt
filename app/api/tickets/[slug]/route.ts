import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const DATA_PATH = path.join(process.cwd(), 'data', 'tickets.json');

function loadTickets() {
  try {
    const raw = readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function loadReviews() {
  try {
    const raw = readFileSync(path.join(process.cwd(), 'data', 'reviews.json'), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const tickets = loadTickets() as { slug: string;[k: string]: unknown }[];
  const ticket = tickets.find((t) => t.slug === slug);
  if (!ticket) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const reviews = loadReviews() as any[];
  const ticketReviews = reviews.filter((r) => r.ticketSlug === slug);
  let averageRating = 0;
  if (ticketReviews.length > 0) {
    const total = ticketReviews.reduce((sum: number, r: any) => sum + r.rating, 0);
    averageRating = total / ticketReviews.length;
  }

  ticket.averageRating = averageRating.toFixed(1);
  ticket.reviewCount = ticketReviews.length;

  return NextResponse.json(ticket);
}
