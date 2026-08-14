import { CHECK_INTERVAL_MINUTES, TELEGRAM_BOT_TOKEN } from "@config";
import { subscriptionsDB } from "@db/subscriptions";
import { Telegraf } from "telegraf";

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

bot.start(async (ctx) => {
  const chatId = ctx.chat.id;
  await subscriptionsDB.add(chatId);

  await ctx.reply(
    `🎭 Бот проверки билетов теперь активен.
Я буду проверять афиши периодически и сообщу Вам, если они появятся.
По умолчанию я присылаю только сообщения о найденных билетах и об ошибках проверки.
Чтобы получать результат каждой проверки, отправьте /verbose.
Текущий интервал проверок: ${CHECK_INTERVAL_MINUTES} минут.`,
  );
});

bot.command("stop", async (ctx) => {
  const chatId = ctx.chat.id;
  await subscriptionsDB.remove(chatId);
  await ctx.reply("Вы больше не будете получать уведомления в этом чате.");
});

bot.command("quiet", async (ctx) => {
  const chatId = ctx.chat.id;
  const updated = await subscriptionsDB.setVerbose(chatId, false);
  if (!updated) {
    await ctx.reply("Сначала отправьте /start, чтобы подписаться.");
    return;
  }

  await ctx.reply(
    `Режим уведомлений: только важное.
Я буду присылать сообщения только когда найдены билеты или когда не удалось проверить афишу.`,
  );
});

bot.command("verbose", async (ctx) => {
  const chatId = ctx.chat.id;
  const updated = await subscriptionsDB.setVerbose(chatId, true);
  if (!updated) {
    await ctx.reply("Сначала отправьте /start, чтобы подписаться.");
    return;
  }

  await ctx.reply(
    `Режим уведомлений: все сообщения.
Я буду присылать результат каждой проверки, включая случаи, когда новых билетов нет.`,
  );
});

bot.command("status", async (ctx) => {
  const chatId = ctx.chat.id;
  const subscription = await subscriptionsDB.getByChatId(chatId);
  const lines = [`Статус подписки: ${subscription ? "активна ✅" : "не активна ❌"}`];
  if (subscription) {
    lines.push(`Режим уведомлений: ${subscription.verbose ? "все сообщения" : "только важное"}`);
  }
  lines.push(`Интервал проверок: ${CHECK_INTERVAL_MINUTES} минут`);
  await ctx.reply(lines.join("\n"));
});

function launchBot(onLaunch?: () => void) {
  bot.launch(onLaunch);
}

function stopBot(signal: string) {
  bot.stop(signal);
}

async function sendMessage(
  chatId: number,
  message: string,
  options?: {
    silent?: boolean;
  },
) {
  await bot.telegram.sendMessage(chatId, message, {
    disable_notification: options?.silent,
  });
}

export const botHandler = {
  launchBot,
  stopBot,
  sendMessage,
};
