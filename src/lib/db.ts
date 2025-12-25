import { sql } from '@vercel/postgres';

let inited = false;

export async function ensureSchema() {
  if (inited) return;

  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id BIGSERIAL PRIMARY KEY,
      content TEXT NOT NULL,
      sender_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender_id TEXT;`;

  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id BIGSERIAL PRIMARY KEY,
      recipient_client_id TEXT NOT NULL,
      message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      read_at TIMESTAMPTZ
    );
  `;

  inited = true;
}
