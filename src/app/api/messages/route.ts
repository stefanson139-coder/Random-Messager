import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ensureSchema } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  await ensureSchema();

  const body = await req.json().catch(() => ({}));
  const content = typeof body?.content === 'string' ? body.content.trim() : '';

  if (!content) {
    return NextResponse.json({ error: '內容不能為空' }, { status: 400 });
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: '內容太長（最多 2000 字）' }, { status: 413 });
  }

  const { rows } = await sql<{ id: string; created_at: string }>`
    INSERT INTO messages (content)
    VALUES (${content})
    RETURNING id, created_at
  `;

  return NextResponse.json({
    ok: true,
    id: rows[0]?.id,
    createdAt: rows[0]?.created_at,
  });
}
