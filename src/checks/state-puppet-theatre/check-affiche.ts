import { AFFICHE_URL } from "./constants";

/**
 * Fetches the theatre schedule page and extracts the visible text content
 * of elements that have a `data-m` attribute (months with available tickets).
 *
 * For now, this function is used to build a message for the Telegram bot,
 * not to make a strict boolean "available / not available" decision.
 */
export async function checkAffiche(): Promise<Set<string>> {
  const response = await fetch(AFFICHE_URL, {
    headers: {
      // Some sites behave differently without a User-Agent; set a reasonable one.
      "User-Agent":
        "Mozilla/5.0 (compatible; TheatreTicketsNotifier/1.0; +https://puppet-minsk.by/afisha)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch "${AFFICHE_URL}", status ${response.status}`);
  }

  let html = await response.text();

  // Remove HTML comments BEFORE parsing
  html = html.replace(/<!--[\s\S]*?-->/g, '');

  // Very small HTML parser for this specific case:
  // find tags with a data-m attribute and grab their inner text.
  const results: string[] = [];

  const tagWithDataM =
    /<([a-zA-Z0-9]+)([^>]*\sdata-m(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))[^>]*)>([\s\S]*?)<\/\1>/gi;

  let match: RegExpExecArray | null = tagWithDataM.exec(html);
  while (match !== null) {
    const rawInner = match[4] ?? "";

    // Remove any inner HTML tags and collapse whitespace to approximate textContent.
    const text = rawInner
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (text.length > 0) {
      results.push(text);
    }

    match = tagWithDataM.exec(html);
  }

  const months = new Set(results);
  return months;
}
