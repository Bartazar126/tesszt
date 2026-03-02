import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
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

function saveTickets(tickets: unknown[]) {
  writeFileSync(DATA_PATH, JSON.stringify(tickets, null, 2), 'utf-8');
}

export async function GET() {
  const tickets = loadTickets();
  return NextResponse.json({ tickets });
}
