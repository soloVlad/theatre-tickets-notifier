import { AFFICHE_URL } from "./constants";

export function prepareFoundMessage(months: string[]) {
  const bodyLines = months.map((month) => `• ${month}`);
  const message = [
    "🎟 Обнаружены доступные месяцы для покупки билетов в Театр Кукол:",
    ...bodyLines,
    "",
    `Скорее за покупками: ${AFFICHE_URL}`,
  ].join("\n");

  return message;
}
