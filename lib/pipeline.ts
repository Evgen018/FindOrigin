/**
 * Пайплайн обработки: ввод → парсинг → извлечение сущностей
 * (Этапы 3–4; этап 5 — поиск — будет добавлен позже)
 */

import {
  parseInput,
  getTextForAnalysis,
  isUnfetchableTelegramLink,
} from "@/lib/input";
import { extractEntities, type ExtractedEntities } from "@/lib/entities";

export type PipelineResult =
  | { success: true; entities: ExtractedEntities; text: string }
  | {
      success: false;
      reason: "empty" | "telegram_link";
      message: string;
    };

/**
 * Запускает пайплайн: парсинг ввода + извлечение сущностей
 */
export function runPipeline(rawInput: string): PipelineResult {
  const parsed = parseInput(rawInput);

  if (parsed.type === "text" && (!parsed.text || parsed.text.length === 0)) {
    return {
      success: false,
      reason: "empty",
      message:
        "Введите текст для анализа или ссылку на Telegram-пост.\n\n" +
        "К сожалению, по ссылке на пост бот не может получить текст автоматически. " +
        "Скопируйте текст поста и отправьте его сюда.",
    };
  }

  if (isUnfetchableTelegramLink(parsed)) {
    return {
      success: false,
      reason: "telegram_link",
      message:
        "Это ссылка на Telegram-пост. Бот не может получить текст поста по ссылке.\n\n" +
        "Скопируйте текст поста и отправьте его сюда для анализа.",
    };
  }

  const text = getTextForAnalysis(parsed);
  if (!text) {
    return {
      success: false,
      reason: "empty",
      message: "Не удалось получить текст для анализа.",
    };
  }

  const entities = extractEntities(text);
  return { success: true, entities, text };
}

/**
 * Форматирует результат извлечения сущностей в текст для отправки пользователю
 */
export function formatEntitiesForUser(entities: ExtractedEntities): string {
  const parts: string[] = ["✅ <b>Обработано. Извлечено:</b>"];

  if (entities.claims.length > 0) {
    parts.push(`\n<b>Утверждения:</b> ${entities.claims.length}`);
    entities.claims.slice(0, 3).forEach((c, i) => {
      parts.push(`  ${i + 1}. ${c.slice(0, 80)}${c.length > 80 ? "…" : ""}`);
    });
  }
  if (entities.dates.length > 0) {
    parts.push(`\n<b>Даты:</b> ${entities.dates.join(", ")}`);
  }
  if (entities.numbers.length > 0) {
    parts.push(`\n<b>Числа:</b> ${entities.numbers.slice(0, 10).join(", ")}`);
  }
  if (entities.names.length > 0) {
    parts.push(`\n<b>Имена/организации:</b> ${entities.names.slice(0, 5).join(", ")}`);
  }
  if (entities.links.length > 0) {
    parts.push(`\n<b>Ссылки:</b> ${entities.links.length}`);
  }
  parts.push(`\n<b>Поисковые подсказки:</b> ${entities.searchHints.slice(0, 10).join(" | ")}`);
  parts.push("\n\n<i>Этап поиска источников будет добавлен позже.</i>");

  return parts.join("");
}
