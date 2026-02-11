import { botHandler } from "../../bot";
import { subscriptionsDB } from "../../db/subscriptions";
import { checkAffiche } from "./check-affiche";

export async function checkStatePuppetTheatre() {
  try {
    const subscribedChatIds = await subscriptionsDB.getAll();
    if (subscribedChatIds.length === 0) {
      return;
    }

    const availableTexts = await checkAffiche();
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
    console.error(
      "Error while checking tickets or sending notification for State Puppet Theatre:",
      error,
    );
  }
}
