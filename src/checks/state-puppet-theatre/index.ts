import { botHandler } from "@bot";
import { subscriptionsDB } from "@db/subscriptions";
import { getSetDifference } from "@util";
import { checkAffiche } from "./check-affiche";
import { prepareFoundMessage } from "./prepare-found-message";
import { readSavedAffiche } from "./read-saved-affiche";
import { saveAffiche } from "./save-affiche";

export async function checkStatePuppetTheatre() {
  try {
    const subscribedChatIds = await subscriptionsDB.getAll();
    if (subscribedChatIds.length === 0) {
      return;
    }

    const availableMonthsSet = await checkAffiche();
    if (availableMonthsSet.size === 0) {
      return;
    }

    const savedMonths = readSavedAffiche() as string[];
    const savedMonthsSet = new Set(savedMonths);

    const newMonthsSet = getSetDifference(savedMonthsSet, availableMonthsSet);

    if (!newMonthsSet.size) {
      for (const chatId of subscribedChatIds) {
        await botHandler.sendMessage(
          chatId,
          `Новых билетов не обнаружено.\nПрошлая проверка:\n${savedMonths.join("\n")}`,
          { silent: true },
        );
      }

      return;
    }

    const availableMonths = Array.from(availableMonthsSet);
    saveAffiche(availableMonths);

    const newMonths = Array.from(newMonthsSet);
    const foundMessage = prepareFoundMessage(newMonths);

    for (const chatId of subscribedChatIds) {
      await botHandler.sendMessage(chatId, foundMessage);
    }
  } catch (error) {
    console.error(
      "Error while checking tickets or sending notification for State Puppet Theatre:",
      error,
    );
  }
}
