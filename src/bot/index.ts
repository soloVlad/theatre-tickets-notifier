import { Telegraf } from "telegraf";
import { CHECK_INTERVAL_MINUTES, TELEGRAM_BOT_TOKEN } from "../config";
import { subscriptionsDB } from "../db/subscriptions";

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

bot.start(async (ctx) => {
  const chatId = ctx.chat.id;
  await subscriptionsDB.add(chatId);

  await ctx.reply(
    `🎭 Бот проверки билетов теперь активен.
Я буду проверять афиши периодически и сообщу Вам, если они появятся.
Текущий интервал проверок: ${CHECK_INTERVAL_MINUTES} минут.`,
  );
});

bot.command("stop", async (ctx) => {
  const chatId = ctx.chat.id;
  await subscriptionsDB.remove(chatId);
  await ctx.reply("Вы больше не будете получать уведомления в этом чате.");
});

bot.command("status", async (ctx) => {
  const chatId = ctx.chat.id;
  const subscribed = await subscriptionsDB.checkIsSubscribed(chatId);
  await ctx.reply(
    [
      `Статус подписки: ${subscribed ? "активна ✅" : "не активна ❌"}`,
      `Интервал проверок: ${CHECK_INTERVAL_MINUTES} минут`,
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
