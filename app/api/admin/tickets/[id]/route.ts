import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const tickets = loadTickets() as Record<string, unknown>[];
  const ticket = tickets.find((t) => String(t.id) === id);
  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }
  return NextResponse.json({ ticket });
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  let body: Record<string, unknown>;
  try {
    body = await _req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const tickets = loadTickets() as Record<string, unknown>[];
  const index = tickets.findIndex((t) => String(t.id) === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  const allowed = [
    'name', 'priceAdult', 'priceChild', 'stock', 'duration',
    'longDescription', 'included', 'notIncluded', 'important',
    'meetingPoint', 'mapSrc', 'closures', 'thumbnail', 'images', 'slug',
    'openingTime', 'closingTime'
  ];
  for (const key of allowed) {
    if (body[key] !== undefined) {
      let val = body[key];
      if (typeof val === 'string') {
        let s = val as string;
        s = s.replace(/&nbsp;/g, ' ');
        s = s.replace(/\s*style="[^"]*"/gi, '');
        val = s;
      } else if (val && typeof val === 'object' && !Array.isArray(val)) {
        const objVal = val as Record<string, string>;
        for (const k in objVal) {
          if (typeof objVal[k] === 'string') {
            objVal[k] = objVal[k].replace(/&nbsp;/g, ' ');
            objVal[k] = objVal[k].replace(/\s*style="[^"]*"/gi, '');
          }
        }
      }
      (tickets[index] as Record<string, unknown>)[key] = val;
    }
  }

  saveTickets(tickets);
  return NextResponse.json({ ticket: tickets[index] });
}
