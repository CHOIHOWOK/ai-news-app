import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { count, desc, eq, isNull, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { CategoryBar } from "@/components/category-bar";
import { NewsCard } from "@/components/news-card";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";

export const metadata = { title: "대시보드 · AI뉴스수집기" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  // 페이지는 proxy에서 막지 않으므로 여기서 직접 인증을 확인한다
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { category } = await searchParams;

  const [categoryRows, countRows] = await Promise.all([
    db.select().from(categories).orderBy(categories.id),
    db
      .select({ categoryId: articles.categoryId, total: count() })
      .from(articles)
      .groupBy(articles.categoryId),
  ]);

  const counts = new Map(countRows.map((r) => [r.categoryId, r.total]));
  const totalCount = countRows.reduce((sum, r) => sum + r.total, 0);

  // 존재하지 않는 값이면 전체로 취급한다
  const selected =
    category === "none" || categoryRows.some((c) => String(c.id) === category)
      ? (category as string)
      : "all";

  const where =
    selected === "all"
      ? undefined
      : selected === "none"
        ? isNull(articles.categoryId)
        : eq(articles.categoryId, Number(selected));

  const rows = await db
    .select({ article: articles, categoryName: categories.name })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(where)
    .orderBy(
      sql`${articles.publishedAt} desc nulls last`,
      desc(articles.fetchedAt),
    );

  const chips = [
    { key: "all", name: "전체", count: totalCount },
    ...categoryRows.map((c) => ({
      key: String(c.id),
      name: c.name,
      count: counts.get(c.id) ?? 0,
    })),
    { key: "none", name: "미분류", count: counts.get(null) ?? 0 },
  ];

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">
            AI뉴스수집기
          </span>
          <UserButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            오늘의 AI 뉴스
          </h1>
          <p className="mt-1 text-sm text-zinc-500">총 {totalCount}건</p>
        </div>

        <div className="mt-6">
          <CategoryBar chips={chips} selected={selected} />
        </div>

        {rows.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-zinc-300 py-16 text-center text-zinc-500 dark:border-zinc-700">
            {selected === "all"
              ? "아직 수집된 뉴스가 없어요."
              : "이 카테고리에는 뉴스가 없어요."}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map(({ article, categoryName }) => (
              <NewsCard
                key={article.id}
                article={article}
                categoryName={categoryName}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
