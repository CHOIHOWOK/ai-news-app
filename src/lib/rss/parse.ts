import Parser from "rss-parser";
import type { Feed } from "./feeds";

export type FeedItem = {
  url: string;
  originalTitle: string;
  author: string | null;
  summary: string;
  publishedAt: Date | null;
};

const parser = new Parser({
  timeout: 10_000,
  headers: { "User-Agent": "ai-news-collector/0.1" },
});

const SUMMARY_MAX = 300;

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&#8217;": "’",
  "&#8216;": "‘",
  "&#8220;": "“",
  "&#8221;": "”",
  "&nbsp;": " ",
};

// HTML 태그와 엔티티를 제거하고 길이를 제한한다
function toPlainText(html: string): string {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[#\w]+;/g, (m) => ENTITIES[m] ?? " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > SUMMARY_MAX ? `${text.slice(0, SUMMARY_MAX - 1)}…` : text;
}

export async function parseFeed(feed: Feed): Promise<FeedItem[]> {
  const result = await parser.parseURL(feed.url);

  const items: FeedItem[] = [];
  for (const item of result.items) {
    const url = item.link?.trim();
    const title = item.title?.trim();
    if (!url || !title) continue;

    const time = item.isoDate ? new Date(item.isoDate) : null;
    items.push({
      url,
      originalTitle: title,
      author: (item.creator ?? item.author)?.trim() || null,
      summary: toPlainText(item.contentSnippet || item.content || title),
      publishedAt: time && !Number.isNaN(time.getTime()) ? time : null,
    });
  }
  return items;
}
