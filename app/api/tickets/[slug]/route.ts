import { NextResponse } from 'next/server';
import ticketsData from '@/data/tickets.json';
import reviewsData from '@/data/reviews.json';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const tickets = ticketsData as { slug: string;[k: string]: unknown }[];
  const ticket = tickets.find((t) => t.slug === slug);
  if (!ticket) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const reviews = reviewsData as any[];
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
