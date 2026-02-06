/**
 * Поиск через Serper API (Google Search)
 * https://serper.dev — бесплатно 2500 запросов/месяц
 */

const SERPER_URL = "https://google.serper.dev/search";

export interface SearchResult {
  link: string;
  title: string;
  snippet: string;
}

export interface SearchResponse {
  success: boolean;
  items?: SearchResult[];
  error?: string;
}

export async function searchWeb(
  query: string,
  options?: { num?: number }
): Promise<SearchResponse> {
  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "SERPER_API_KEY не задан. Получить: https://serper.dev",
    };
  }

  try {
    const res = await fetch(SERPER_URL, {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        num: Math.min(options?.num ?? 10, 10),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.message ?? data.error ?? `HTTP ${res.status}`,
      };
    }

    const organic = data.organic ?? [];
    const items: SearchResult[] = organic.map(
      (item: { link?: string; title?: string; snippet?: string }) => ({
        link: item.link ?? "",
        title: item.title ?? "",
        snippet: item.snippet ?? "",
      })
    );

    return { success: true, items };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
