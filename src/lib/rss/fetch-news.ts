import { and, desc, inArray, isNull, notLike } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { enrichArticles, type Enriched } from "@/lib/ai/enrich";
import { FEEDS } from "./feeds";
import { parseFeed, type FeedItem } from "./parse";

const WINDOW_MS = 24 * 60 * 60 * 1000;
// 이전 가져오기에서 Claude 처리에 실패한 기사를 이번에 다시 시도하는 최대 건수
const RETRY_LIMIT = 40;

export type FeedResult = {
  source: string;
  ok: boolean;
  found: number;
  inserted: number;
  error?: string;
};

export type AiResult = {
  // Claude로 번역·요약·분류를 마친 건수
  processed: number;
  // 처리에 실패해 원문으로 남은 건수 (다음 가져오기 때 재시도)
  failed: number;
};

type Candidate = FeedItem & { sourceName: string };

export async function fetchNews(): Promise<{ feeds: FeedResult[]; ai: AiResult }> {
  const since = Date.now() - WINDOW_MS;

  // 피드를 독립적으로 파싱해 한쪽이 실패해도 다른 쪽은 계속 처리한다
  const settled = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const items = await parseFeed(feed);
      // 발행 시각이 없는 항목은 24시간 안인지 알 수 없으므로 제외한다
      return items
        .filter((i) => i.publishedAt && i.publishedAt.getTime() >= since)
        .map((i): Candidate => ({ ...i, sourceName: feed.sourceName }));
    }),
  );

  const recent: Candidate[] = [];
  const feeds = settled.map((r, idx): FeedResult => {
    const source = FEEDS[idx].sourceName;
    if (r.status === "fulfilled") {
      recent.push(...r.value);
      return { source, ok: true, found: r.value.length, inserted: 0 };
    }
    console.error(`[fetchNews] ${source} 실패`, r.reason);
    return {
      source,
      ok: false,
      found: 0,
      inserted: 0,
      error: "피드를 가져오지 못했어요",
    };
  });

  // 이미 저장된 url은 제외하고 신규 기사만 남긴다
  const existing = recent.length
    ? await db
        .select({ url: articles.url })
        .from(articles)
        .where(
          inArray(
            articles.url,
            recent.map((i) => i.url),
          ),
        )
    : [];
  const existingUrls = new Set(existing.map((e) => e.url));
  const seen = new Set<string>();
  const fresh = recent.filter((i) => {
    if (existingUrls.has(i.url) || seen.has(i.url)) return false;
    seen.add(i.url);
    return true;
  });

  // 이전에 Claude 처리에 실패한 기사 (샘플 데이터 example.com은 제외)
  const retry = await db
    .select({
      id: articles.id,
      originalTitle: articles.originalTitle,
      summaryKo: articles.summaryKo,
      sourceName: articles.sourceName,
    })
    .from(articles)
    .where(
      and(isNull(articles.aiProcessedAt), notLike(articles.url, "https://example.com%")),
    )
    .orderBy(desc(articles.publishedAt))
    .limit(RETRY_LIMIT);

  if (fresh.length === 0 && retry.length === 0) {
    return { feeds, ai: { processed: 0, failed: 0 } };
  }

  const cats = await db.select().from(categories);
  const catIdByName = new Map(cats.map((c) => [c.name, c.id]));

  const enriched = await enrichArticles(
    [
      ...fresh.map((i) => ({
        title: i.originalTitle,
        summary: i.summary,
        source: i.sourceName,
      })),
      ...retry.map((a) => ({
        title: a.originalTitle,
        summary: a.summaryKo,
        source: a.sourceName,
      })),
    ],
    cats,
  );
  const freshResult = enriched.slice(0, fresh.length);
  const retryResult = enriched.slice(fresh.length);

  const now = new Date();
  const fields = (e: Enriched) => ({
    titleKo: e.titleKo,
    summaryKo: e.summaryKo,
    categoryId: (e.category && catIdByName.get(e.category)) || null,
    aiProcessedAt: now,
  });

  // 신규 기사 저장. Claude 처리에 실패한 기사는 원문으로 채워 둔다
  if (fresh.length > 0) {
    const inserted = await db
      .insert(articles)
      .values(
        fresh.map((i, idx) => {
          const e = freshResult[idx];
          return {
            sourceName: i.sourceName,
            url: i.url,
            originalTitle: i.originalTitle,
            author: i.author,
            titleKo: i.originalTitle,
            summaryKo: i.summary,
            publishedAt: i.publishedAt,
            ...(e ? fields(e) : {}),
          };
        }),
      )
      .onConflictDoNothing({ target: articles.url })
      .returning({ sourceName: articles.sourceName });

    for (const row of inserted) {
      const feed = feeds.find((f) => f.source === row.sourceName);
      if (feed) feed.inserted += 1;
    }
  }

  // 재시도 대상 갱신
  await Promise.all(
    retry.map((a, idx) => {
      const e = retryResult[idx];
      if (!e) return null;
      return db.update(articles).set(fields(e)).where(inArray(articles.id, [a.id]));
    }),
  );

  const total = enriched.length;
  const processed = enriched.filter(Boolean).length;
  return { feeds, ai: { processed, failed: total - processed } };
}
