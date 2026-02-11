import { Pool } from "pg";
import { DATABASE_URL } from "../config";

export const pool = new Pool({
  connectionString: DATABASE_URL,
});

export async function closePool(): Promise<void> {
  await pool.end();
}
