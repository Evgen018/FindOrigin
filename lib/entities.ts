/**
 * Извлечение сущностей из текста: утверждения, даты, числа, имена, ссылки
 */

export interface ExtractedEntities {
  /** Ключевые утверждения (короткие фразы-тезисы) */
  claims: string[];
  /** Найденные даты */
  dates: string[];
  /** Значимые числа */
  numbers: string[];
  /** Имена (персоны, организации) — эвристика по заглавным буквам */
  names: string[];
  /** Ссылки */
  links: string[];
  /** Поисковые подсказки: объединённый набор для этапа поиска */
  searchHints: string[];
}

const URL_REGEX =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;

const DATE_PATTERNS = [
  /\d{1,2}[./]\d{1,2}[./]\d{2,4}/g,
  /\d{4}-\d{2}-\d{2}/g,
  /\d{1,2}\s+(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)\s+\d{2,4}/gi,
  /\d{1,2}\s+(?:янв|фев|мар|апр|мая|июн|июл|авг|сен|окт|ноя|дек)\.?\s+\d{2,4}/gi,
];

const NUMBER_REGEX = /\b\d+[\d\s.,]*\d*\b|\b\d+\b/g;

/** Паттерн для имён: слова с заглавной буквы (2+ подряд часто — имя/организация) */
const NAME_CANDIDATES_REGEX = /\b[А-ЯЁA-Z][а-яёa-z]+(?:\s+[А-ЯЁA-Z][а-яёa-z]+)*\b/g;

/** Минимальная длина утверждения в символах */
const MIN_CLAIM_LENGTH = 10;
/** Максимальная длина одного утверждения */
const MAX_CLAIM_LENGTH = 200;

/**
 * Разбивает текст на предложения
 */
function splitSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= MIN_CLAIM_LENGTH && s.length <= MAX_CLAIM_LENGTH);
}

/**
 * Извлекает сущности из текста
 */
export function extractEntities(text: string): ExtractedEntities {
  const claims: string[] = [];
  const dates: string[] = [];
  const numbers: string[] = [];
  const names: string[] = [];
  const links: string[] = [];

  // Ссылки
  const linkMatches = text.match(URL_REGEX);
  if (linkMatches) {
    links.push(...Array.from(new Set(linkMatches)));
  }

  // Даты
  for (const pattern of DATE_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) dates.push(...Array.from(new Set(matches)));
  }

  // Числа
  const numMatches = text.match(NUMBER_REGEX);
  if (numMatches) {
    numbers.push(...Array.from(new Set(numMatches)).slice(0, 20));
  }

  // Кандидаты на имена
  const nameMatches = text.match(NAME_CANDIDATES_REGEX);
  if (nameMatches) {
    const seen = new Set<string>();
    for (const m of nameMatches) {
      const normalized = m.trim();
      if (normalized.length >= 3 && !seen.has(normalized)) {
        seen.add(normalized);
        names.push(normalized);
      }
    }
  }

  // Утверждения — предложения без ссылок, не только числа
  const urlTest = new RegExp(URL_REGEX.source, "i");
  const sentences = splitSentences(text);
  for (const s of sentences) {
    if (s.length >= MIN_CLAIM_LENGTH && !urlTest.test(s)) {
      claims.push(s);
    }
  }
  if (claims.length === 0 && text.length >= MIN_CLAIM_LENGTH) {
    claims.push(text.slice(0, MAX_CLAIM_LENGTH));
  }

  // Поисковые подсказки: claims + имена + даты + числа (уникальные, до 15)
  const hintsSet = new Set<string>();
  for (const c of claims.slice(0, 3)) hintsSet.add(c);
  for (const n of names.slice(0, 5)) hintsSet.add(n);
  for (const d of dates) hintsSet.add(d);
  for (const num of numbers.slice(0, 5)) hintsSet.add(num);
  const searchHints = Array.from(hintsSet).slice(0, 15);

  return {
    claims,
    dates,
    numbers,
    names,
    links,
    searchHints,
  };
}
