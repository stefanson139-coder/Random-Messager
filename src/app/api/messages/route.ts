import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ensureSchema } from '@/lib/db';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  await ensureSchema();

  const body = await req.json().catch(() => ({}));
  const content = typeof body?.content === 'string' ? body.content.trim() : '';

  if (!content) {
    return NextResponse.json({ error: 'Content cannot be empty.' }, { status: 400 });
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: 'Content is too long (max 2000 chars).' }, { status: 413 });
  }

  const senderId = cookies().get('mp_client_id')?.value || null;

  const { rows } = await sql<{ id: string; created_at: string }>`
    INSERT INTO messages (content, sender_id)
    VALUES (${content}, ${senderId})
    RETURNING id, created_at
  `;

  return NextResponse.json({
    ok: true,
    id: rows[0]?.id,
    createdAt: rows[0]?.created_at,
  });
}
