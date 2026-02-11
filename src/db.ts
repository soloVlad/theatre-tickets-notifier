import { Pool } from "pg";
import { DATABASE_URL } from "./config";

const pool = new Pool({
  connectionString: DATABASE_URL,
});

export async function ensureSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_subscriptions (
      chat_id BIGINT PRIMARY KEY,
      subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function addSubscription(chatId: number): Promise<void> {
  await pool.query(
    `
      INSERT INTO chat_subscriptions (chat_id)
      VALUES ($1)
      ON CONFLICT (chat_id) DO NOTHING
    `,
    [chatId],
  );
}

export async function removeSubscription(chatId: number): Promise<void> {
  await pool.query("DELETE FROM chat_subscriptions WHERE chat_id = $1", [chatId]);
}

export async function isSubscribed(chatId: number): Promise<boolean> {
  const result = await pool.query("SELECT 1 FROM chat_subscriptions WHERE chat_id = $1", [chatId]);
  return result.rowCount !== null && result.rowCount > 0;
}

export async function getAllSubscriptions(): Promise<number[]> {
  const result = await pool.query<{ chat_id: string | number }>(
    "SELECT chat_id FROM chat_subscriptions",
  );
  return result.rows.map((row) => Number(row.chat_id));
}

export async function closePool(): Promise<void> {
  await pool.end();
}
