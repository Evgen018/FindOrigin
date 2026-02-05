/**
 * Обработка ввода пользователя: текст или ссылка на Telegram-пост
 */

const TELEGRAM_LINK_PATTERNS = [
  /^https?:\/\/(www\.)?t\.me\/([^/]+)(?:\/(\d+))?/i,
  /^https?:\/\/(www\.)?telegram\.me\/([^/]+)(?:\/(\d+))?/i,
  /^https?:\/\/(www\.)?telegram\.dog\/([^/]+)(?:\/(\d+))?/i,
];

export type InputType = "text" | "telegram_link";

export interface ParsedInput {
  type: InputType;
  /** Исходная строка от пользователя */
  raw: string;
  /** Текст для анализа (если type === "text") */
  text?: string;
  /** Если это ссылка — данные для возможного извлечения */
  telegramLink?: {
    channelOrChat: string;
    messageId?: number;
  };
}

/**
 * Определяет формат ввода: обычный текст или ссылка на Telegram-пост
 */
export function parseInput(raw: string): ParsedInput {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { type: "text", raw: trimmed, text: "" };
  }

  for (const pattern of TELEGRAM_LINK_PATTERNS) {
    const m = trimmed.match(pattern);
    if (m) {
      const channelOrChat = m[2];
      const messageId = m[3] ? parseInt(m[3], 10) : undefined;
      return {
        type: "telegram_link",
        raw: trimmed,
        telegramLink: { channelOrChat, messageId },
      };
    }
  }

  return { type: "text", raw: trimmed, text: trimmed };
}

/**
 * Получить текст для анализа.
 * Для обычного текста — возвращает сам текст.
 * Для ссылки на пост — Bot API не позволяет получать контент постов из каналов/чатов,
 * поэтому возвращает null и нужно попросить пользователя вставить текст вручную.
 */
export function getTextForAnalysis(parsed: ParsedInput): string | null {
  if (parsed.type === "text" && parsed.text) {
    return parsed.text;
  }
  if (parsed.type === "telegram_link") {
    return null;
  }
  return parsed.text ?? null;
}

/**
 * Проверяет, является ли ввод ссылкой на Telegram, по которой нельзя получить текст
 */
export function isUnfetchableTelegramLink(parsed: ParsedInput): boolean {
  return parsed.type === "telegram_link";
}
