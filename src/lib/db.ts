import { sql } from '@vercel/postgres';

let inited = false;

export async function ensureSchema() {
  if (inited) return;
  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id BIGSERIAL PRIMARY KEY,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  inited = true;
}
