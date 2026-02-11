import { pool } from ".";

async function ensureSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_subscriptions (
      chat_id BIGINT PRIMARY KEY,
      subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function add(chatId: number): Promise<void> {
  await pool.query(
    `
      INSERT INTO chat_subscriptions (chat_id)
      VALUES ($1)
      ON CONFLICT (chat_id) DO NOTHING
    `,
    [chatId],
  );
}

async function remove(chatId: number): Promise<void> {
  await pool.query("DELETE FROM chat_subscriptions WHERE chat_id = $1", [chatId]);
}

async function checkIsSubscribed(chatId: number): Promise<boolean> {
  const result = await pool.query("SELECT 1 FROM chat_subscriptions WHERE chat_id = $1", [chatId]);
  return result.rowCount !== null && result.rowCount > 0;
}

async function getAll(): Promise<number[]> {
  const result = await pool.query<{ chat_id: string | number }>(
    "SELECT chat_id FROM chat_subscriptions",
  );
  return result.rows.map((row) => Number(row.chat_id));
}

export const subscriptionsDB = {
  ensureSchema,
  add,
  remove,
  checkIsSubscribed,
  getAll,
};
