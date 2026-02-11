import { CHECK_INTERVAL_MINUTES } from "./config";
import { checkTicketsAvailable } from "./checkTickets";
import { closePool } from "./db";
import { subscriptionsDB } from "./db/subscriptions";
import { botHandler } from "./bot";
import { minToMs } from "./util";

async function runPeriodicCheck() {
  try {
    const subscribedChatIds = await subscriptionsDB.getAll();
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
      await botHandler.sendMessage(chatId, message);
    }
  } catch (error) {
    console.error("Error while checking tickets or sending notification:", error);
  }
}

async function main() {
  await subscriptionsDB.ensureSchema();

  botHandler.launchBot(() => {
    console.log("Telegram bot started.");
    console.log(`Checking for ticket availability every ${CHECK_INTERVAL_MINUTES} minute(s).`);

    const intervalMs = minToMs(CHECK_INTERVAL_MINUTES);
    setInterval(runPeriodicCheck, intervalMs);

    for (const signal of ["SIGINT", "SIGTERM"]) {
      process.once(signal, async () => {
        await closePool();
        botHandler.stopBot(signal);
        process.exit(0);
      });
    }
  });
}

main().catch((err) => {
  console.error("Failed to start bot:", err);
  process.exit(1);
});
