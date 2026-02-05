/**
 * Утилиты для работы с Telegram Bot API
 */

const TELEGRAM_API = "https://api.telegram.org/bot";

export function getBotUrl(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN не задан");
  return `${TELEGRAM_API}${token}`;
}

export async function sendMessage(
  chatId: number,
  text: string,
  options?: { parse_mode?: "HTML" | "Markdown"; disable_web_page_preview?: boolean }
): Promise<void> {
  const url = getBotUrl() + "/sendMessage";
  const body = {
    chat_id: chatId,
    text,
    parse_mode: options?.parse_mode ?? "HTML",
    disable_web_page_preview: options?.disable_web_page_preview ?? true,
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram API error: ${res.status} ${err}`);
  }
}
