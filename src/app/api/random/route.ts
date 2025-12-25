import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ensureSchema } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  await ensureSchema();

  const { rows } = await sql<{ id: string; content: string; created_at: string }>`
    SELECT id, content, created_at
    FROM messages
    ORDER BY RANDOM()
    LIMIT 1
  `;

  if (!rows.length) {
    return NextResponse.json({ error: '訊息池目前是空的' }, { status: 404 });
  }

  return NextResponse.json({
    message: {
      id: rows[0].id,
      content: rows[0].content,
      createdAt: rows[0].created_at,
    },
  });
}
