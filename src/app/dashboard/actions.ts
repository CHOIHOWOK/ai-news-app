"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { saveArticleToNotion } from "@/lib/notion/save-article";
import { fetchNews, type AiResult, type FeedResult } from "@/lib/rss/fetch-news";

export async function saveToNotionAction(
  articleId: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "로그인이 필요해요" };

  const result = await saveArticleToNotion(articleId);
  if (!result.ok) return result;
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteArticleAction(
  articleId: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "로그인이 필요해요" };

  try {
    await db.delete(articles).where(eq(articles.id, articleId));
  } catch {
    return { ok: false, error: "삭제하지 못했어요" };
  }
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function fetchNewsAction(): Promise<{
  feeds: FeedResult[];
  ai?: AiResult;
  error?: string;
}> {
  // Server Action은 proxy의 /api 보호 대상이 아니므로 직접 확인한다
  const { userId } = await auth();
  if (!userId) return { feeds: [], error: "로그인이 필요해요" };

  const result = await fetchNews();
  revalidatePath("/dashboard");
  return result;
}
