import { pool } from ".";

export type ChatSubscription = {
  chatId: number;
  verbose: boolean;
};

async function ensureSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_subscriptions (
      chat_id BIGINT PRIMARY KEY,
      subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      verbose BOOLEAN NOT NULL DEFAULT FALSE
    )
  `);
  await pool.query(`
    ALTER TABLE chat_subscriptions
      ADD COLUMN IF NOT EXISTS verbose BOOLEAN NOT NULL DEFAULT FALSE
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

async function getByChatId(chatId: number): Promise<ChatSubscription | null> {
  const result = await pool.query<{ chat_id: string | number; verbose: boolean }>(
    "SELECT chat_id, verbose FROM chat_subscriptions WHERE chat_id = $1",
    [chatId],
  );
  const row = result.rows[0];
  if (!row) {
    return null;
  }
  return {
    chatId: Number(row.chat_id),
    verbose: row.verbose,
  };
}

async function getAll(): Promise<ChatSubscription[]> {
  const result = await pool.query<{ chat_id: string | number; verbose: boolean }>(
    "SELECT chat_id, verbose FROM chat_subscriptions",
  );
  return result.rows.map((row) => ({
    chatId: Number(row.chat_id),
    verbose: row.verbose,
  }));
}

async function setVerbose(chatId: number, verbose: boolean): Promise<boolean> {
  const result = await pool.query("UPDATE chat_subscriptions SET verbose = $2 WHERE chat_id = $1", [
    chatId,
    verbose,
  ]);
  return result.rowCount !== null && result.rowCount > 0;
}

export const subscriptionsDB = {
  ensureSchema,
  add,
  remove,
  getByChatId,
  getAll,
  setVerbose,
};
