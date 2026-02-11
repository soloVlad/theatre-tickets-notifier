import { Telegraf } from "telegraf";
import { TELEGRAM_BOT_TOKEN, CHECK_INTERVAL_MINUTES } from "./config";
import { checkTicketsAvailable } from "./checkTickets";
import {
  addSubscription,
  getAllSubscriptions,
  isSubscribed,
  removeSubscription,
  ensureSchema,
  closePool,
} from "./db";

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

bot.start(async (ctx) => {
  const chatId = ctx.chat.id;
  await addSubscription(chatId);

  await ctx.reply(
    `🎭 Theatre tickets notifier is now active for this chat.
I'll check for new tickets periodically and send you a message if they appear.
Current check interval: ${CHECK_INTERVAL_MINUTES} minute(s).`,
  );
});

bot.command("stop", async (ctx) => {
  const chatId = ctx.chat.id;
  await removeSubscription(chatId);
  await ctx.reply("You will no longer receive ticket notifications in this chat.");
});

bot.command("status", async (ctx) => {
  const chatId = ctx.chat.id;
  const subscribed = await isSubscribed(chatId);
  await ctx.reply(
    [
      `Subscription status: ${subscribed ? "active ✅" : "inactive ❌"}`,
      `Check interval: ${CHECK_INTERVAL_MINUTES} minute(s)`,
    ].join("\n"),
  );
});

async function runPeriodicCheck() {
  try {
    const subscribedChatIds = await getAllSubscriptions();
    if (subscribedChatIds.length === 0) {
      return;
    }

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
  await ensureSchema();

  bot.launch(() => {
    console.log("Telegram bot started.");
    console.log(`Checking for ticket availability every ${CHECK_INTERVAL_MINUTES} minute(s).`);

    const intervalMs = CHECK_INTERVAL_MINUTES * 60 * 1000;
    setInterval(runPeriodicCheck, intervalMs);

    // Enable graceful stop
    process.once("SIGINT", async () => {
      await closePool();
      bot.stop("SIGINT");
      process.exit(0);
    });
    process.once("SIGTERM", async () => {
      await closePool();
      bot.stop("SIGTERM");
      process.exit(0);
    });
  });
}

main().catch((err) => {
  console.error("Failed to start bot:", err);
  process.exit(1);
});
