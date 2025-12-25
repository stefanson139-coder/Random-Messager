import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ensureSchema } from '@/lib/db';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

export async function GET() {
  await ensureSchema();

  const cookieStore = await cookies();
  const clientId = cookieStore.get('mp_client_id')?.value ?? '';

  if (!clientId) {
    return NextResponse.json({ notifications: [] });
  }

  const { rows } = await sql<{
    id: string;
    message_id: string;
    content: string;
    created_at: string;
  }>`
    SELECT n.id, n.message_id, m.content, n.created_at
    FROM notifications n
    JOIN messages m ON m.id = n.message_id
    WHERE n.recipient_client_id = ${clientId}
      AND n.read_at IS NULL
    ORDER BY n.created_at ASC
    LIMIT 20
  `;

  for (const r of rows) {
    await sql`
      UPDATE notifications
      SET read_at = NOW()
      WHERE id = ${r.id}::bigint
    `;
  }

  return NextResponse.json({
    notifications: rows.map((r) => ({
      id: r.id,
      messageId: r.message_id,
      content: r.content,
      createdAt: r.created_at,
    })),
  });
}
