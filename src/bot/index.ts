import { Telegraf } from "telegraf";
import { CHECK_INTERVAL_MINUTES, TELEGRAM_BOT_TOKEN } from "../config";
import { subscriptionsDB } from "../db/subscriptions";

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

bot.start(async (ctx) => {
  const chatId = ctx.chat.id;
  await subscriptionsDB.add(chatId);

  await ctx.reply(
    `🎭 Theatre tickets notifier is now active for this chat.
I'll check for new tickets periodically and send you a message if they appear.
Current check interval: ${CHECK_INTERVAL_MINUTES} minute(s).`,
  );
});

bot.command("stop", async (ctx) => {
  const chatId = ctx.chat.id;
  await subscriptionsDB.remove(chatId);
  await ctx.reply("You will no longer receive ticket notifications in this chat.");
});

bot.command("status", async (ctx) => {
  const chatId = ctx.chat.id;
  const subscribed = await subscriptionsDB.checkIsSubscribed(chatId);
  await ctx.reply(
    [
      `Subscription status: ${subscribed ? "active ✅" : "inactive ❌"}`,
      `Check interval: ${CHECK_INTERVAL_MINUTES} minute(s)`,
    ].join("\n"),
  );
});

function launchBot(onLaunch?: () => void) {
  bot.launch(onLaunch);
}

function stopBot(signal: string) {
  bot.stop(signal);
}

async function sendMessage(chatId: number, message: string) {
  await bot.telegram.sendMessage(chatId, message);
}

export const botHandler = {
  launchBot,
  stopBot,
  sendMessage,
};
