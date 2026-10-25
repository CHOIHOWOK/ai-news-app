"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { fetchNews, type AiResult, type FeedResult } from "@/lib/rss/fetch-news";

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
