import { Telegraf } from "telegraf";
import { TELEGRAM_BOT_TOKEN, CHECK_INTERVAL_MINUTES } from "./config";
import { checkTicketsAvailable } from "./checkTickets";

// In-memory storage of chat IDs that requested notifications.
// For a real deployment, you may want to persist this in a database.
const subscribedChatIds = new Set<number>();

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

bot.start((ctx) => {
  const chatId = ctx.chat.id;
  subscribedChatIds.add(chatId);

  ctx.reply(
    `🎭 Theatre tickets notifier is now active for this chat.
I'll check for new tickets periodically and send you a message if they appear.
Current check interval: ${CHECK_INTERVAL_MINUTES} minute(s).`,
  );
});

bot.command("stop", (ctx) => {
  const chatId = ctx.chat.id;
  subscribedChatIds.delete(chatId);
  ctx.reply("You will no longer receive ticket notifications in this chat.");
});

bot.command("status", (ctx) => {
  const chatId = ctx.chat.id;
  const isSubscribed = subscribedChatIds.has(chatId);
  ctx.reply(
    [
      `Subscription status: ${isSubscribed ? "active ✅" : "inactive ❌"}`,
      `Check interval: ${CHECK_INTERVAL_MINUTES} minute(s)`,
    ].join("\n"),
  );
});

async function runPeriodicCheck() {
  if (subscribedChatIds.size === 0) {
    return;
  }

  try {
    const availableTexts = await checkTicketsAvailable();
    if (availableTexts.length === 0) {
      return;
    }

    const bodyLines = availableTexts.map((text) => `• ${text}`);
    const message = [
      "🎟 Обнаружены доступные месяцы для покупки билетов на сайте puppet-minsk.by:",
      ...bodyLines,
      "",
      "Источник: https://puppet-minsk.by/afisha",
    ].join("\n");

    for (const chatId of subscribedChatIds) {
      await bot.telegram.sendMessage(chatId, message);
    }
  } catch (error) {
    console.error("Error while checking tickets or sending notification:", error);
  }
}

async function main() {
  bot.launch(() => {
    console.log("Telegram bot started.");
    console.log(`Checking for ticket availability every ${CHECK_INTERVAL_MINUTES} minute(s).`);

    const intervalMs = CHECK_INTERVAL_MINUTES * 60 * 1000;
    setInterval(runPeriodicCheck, intervalMs);

    // Enable graceful stop
    process.once("SIGINT", () => {
      bot.stop("SIGINT");
      process.exit(0);
    });
    process.once("SIGTERM", () => {
      bot.stop("SIGTERM");
      process.exit(0);
    });
  });
}

main().catch((err) => {
  console.error("Failed to start bot:", err);
  process.exit(1);
});
