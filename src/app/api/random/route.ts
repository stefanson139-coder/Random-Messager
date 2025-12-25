import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ensureSchema } from '@/lib/db';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

export async function GET() {
  await ensureSchema();

  const cookieStore = await cookies();
  const pickerId = cookieStore.get('mp_client_id')?.value ?? null;

  const { rows } = await sql<{ id: string; content: string; created_at: string; sender_id: string | null }>`
    SELECT id, content, created_at, sender_id
    FROM messages
    ORDER BY RANDOM()
    LIMIT 1
  `;

  if (!rows.length) {
    return NextResponse.json({ error: 'The message pool is empty.' }, { status: 404 });
  }

  const picked = rows[0];

  if (picked.sender_id && (!pickerId || picked.sender_id !== pickerId)) {
    await sql`
      INSERT INTO notifications (recipient_client_id, message_id)
      VALUES (${picked.sender_id}, ${picked.id}::bigint)
    `;
  }

  return NextResponse.json({
    message: {
      id: picked.id,
      content: picked.content,
      createdAt: picked.created_at,
    },
  });
}
