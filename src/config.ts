import dotenv from "dotenv";

dotenv.config();

const required = (value: string | undefined, name: string): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const TELEGRAM_BOT_TOKEN = required(process.env.TELEGRAM_BOT_TOKEN, "TELEGRAM_BOT_TOKEN");

export const DATABASE_URL = required(process.env.DATABASE_URL, "DATABASE_URL");

// Interval in minutes between checks
const DEFAULT_CHECK_INTERVAL_MINUTES = 30;

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
