import { eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";

const NOTION_VERSION = "2022-06-28";

// Notion 데이터베이스(제목·날짜·요약·출처·카테고리)에 기사 한 건을 페이지로 저장하고 URL을 기록한다
export async function saveArticleToNotion(
  articleId: number,
): Promise<{ ok: true; notionPageUrl: string } | { ok: false; error: string }> {
  const token = process.env.NOTION_API_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!token || !databaseId) {
    return { ok: false, error: "Notion 설정(환경 변수)이 없어요" };
  }

  const [row] = await db
    .select({ article: articles, categoryName: categories.name })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.id, articleId));
  if (!row) return { ok: false, error: "기사를 찾을 수 없어요" };

  const { article, categoryName } = row;
  // 이미 저장된 기사는 다시 만들지 않는다
  if (article.notionPageUrl) {
    return { ok: true, notionPageUrl: article.notionPageUrl };
  }

  const properties: Record<string, unknown> = {
    제목: { title: [{ text: { content: article.titleKo.slice(0, 2000) } }] },
    요약: { rich_text: [{ text: { content: article.summaryKo.slice(0, 2000) } }] },
    출처: { url: article.url },
  };
  if (article.publishedAt) {
    properties["날짜"] = { date: { start: article.publishedAt.toISOString() } };
  }
  if (categoryName) {
    // select 옵션 이름에는 쉼표를 쓸 수 없다
    properties["카테고리"] = { select: { name: categoryName.replace(/,/g, " ") } };
  }

  let res: Response;
  try {
    res = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties,
      }),
    });
  } catch {
    return { ok: false, error: "Notion에 연결하지 못했어요" };
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { code?: string } | null;
    console.error("Notion 저장 실패", res.status, body);
    return {
      ok: false,
      error:
        body?.code === "object_not_found"
          ? "Notion 데이터베이스가 통합(ai-news)에 공유되지 않았어요"
          : "Notion에 저장하지 못했어요",
    };
  }

  const page = (await res.json()) as { url: string };
  await db
    .update(articles)
    .set({ notionPageUrl: page.url })
    .where(eq(articles.id, articleId));
  return { ok: true, notionPageUrl: page.url };
}
