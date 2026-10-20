import { db } from "@/db";
import { articles } from "@/db/schema";
import { FEEDS } from "./feeds";
import { parseFeed } from "./parse";

const WINDOW_MS = 24 * 60 * 60 * 1000;

export type FeedResult = {
  source: string;
  ok: boolean;
  found: number;
  inserted: number;
  error?: string;
};

export async function fetchNews(): Promise<{ feeds: FeedResult[] }> {
  const since = Date.now() - WINDOW_MS;

  // 피드를 독립적으로 처리해 한쪽이 실패해도 다른 쪽은 저장한다
  const settled = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const items = await parseFeed(feed);
      // 발행 시각이 없는 항목은 24시간 안인지 알 수 없으므로 제외한다
      const recent = items.filter(
        (i) => i.publishedAt && i.publishedAt.getTime() >= since,
      );
      if (recent.length === 0) return { found: 0, inserted: 0 };

      // 임시: Claude 번역·요약 단계 전까지 원문으로 한국어 컬럼을 채운다
      const inserted = await db
        .insert(articles)
        .values(
          recent.map((i) => ({
            sourceName: feed.sourceName,
            url: i.url,
            originalTitle: i.originalTitle,
            author: i.author,
            titleKo: i.originalTitle,
            summaryKo: i.summary,
            publishedAt: i.publishedAt,
          })),
        )
        .onConflictDoNothing({ target: articles.url })
        .returning({ id: articles.id });

      return { found: recent.length, inserted: inserted.length };
    }),
  );

  const feeds = settled.map((r, idx): FeedResult => {
    const source = FEEDS[idx].sourceName;
    if (r.status === "fulfilled") return { source, ok: true, ...r.value };
    console.error(`[fetchNews] ${source} 실패`, r.reason);
    return {
      source,
      ok: false,
      found: 0,
      inserted: 0,
      error: "피드를 가져오지 못했어요",
    };
  });

  return { feeds };
}
