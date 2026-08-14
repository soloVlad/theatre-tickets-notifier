import { botHandler } from "@bot";
import { subscriptionsDB } from "@db/subscriptions";
import { getSetDifference } from "@util";
import { checkAffiche } from "./check-affiche";
import { prepareFoundMessage } from "./prepare-found-message";
import { readSavedAffiche } from "./read-saved-affiche";
import { saveAffiche } from "./save-affiche";

export async function checkStatePuppetTheatre() {
  try {
    const subscribers = await subscriptionsDB.getAll();
    if (subscribers.length === 0) {
      return;
    }

    const checkResult = await checkAffiche();
    if (checkResult.status === "all_failed") {
      const errorLines = checkResult.errors.map((error) => `• ${error}`);
      const message = [
        "⚠️ Не удалось проверить афишу Театра Кукол: все URL недоступны или вернули ошибку.",
        ...errorLines,
      ].join("\n");

      for (const { chatId } of subscribers) {
        await botHandler.sendMessage(chatId, message);
      }

      return;
    }

    const availableMonthsSet = checkResult.months;
    if (availableMonthsSet.size === 0) {
      return;
    }

    const savedMonths = readSavedAffiche() as string[];
    const savedMonthsSet = new Set(savedMonths);

    const newMonthsSet = getSetDifference(savedMonthsSet, availableMonthsSet);

    if (!newMonthsSet.size) {
      for (const { chatId, verbose } of subscribers) {
        if (!verbose) {
          continue;
        }

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

    for (const { chatId } of subscribers) {
      await botHandler.sendMessage(chatId, foundMessage);
    }
  } catch (error) {
    console.error(
      "Error while checking tickets or sending notification for State Puppet Theatre:",
      error,
    );
  }
}
