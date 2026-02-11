import { DEFAULT_CHECK_INTERVAL_MINUTES } from "./constants";
import { required } from "./required";
import dotenv from "dotenv";

dotenv.config();

export const TELEGRAM_BOT_TOKEN = required(process.env.TELEGRAM_BOT_TOKEN, "TELEGRAM_BOT_TOKEN");
export const DATABASE_URL = required(process.env.DATABASE_URL, "DATABASE_URL");

export const CHECK_INTERVAL_MINUTES = (() => {
  const raw = process.env.CHECK_INTERVAL_MINUTES;
  if (!raw) return DEFAULT_CHECK_INTERVAL_MINUTES;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    console.warn(
      `Invalid CHECK_INTERVAL_MINUTES="${raw}", falling back to default ${DEFAULT_CHECK_INTERVAL_MINUTES} minutes`,
    );
    return DEFAULT_CHECK_INTERVAL_MINUTES;
  }
  return parsed;
})();
