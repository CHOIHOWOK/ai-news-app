import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { and, count, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { CategoryBar } from "@/components/category-bar";
import { FetchNewsButton } from "@/components/fetch-news-button";
import { NewsCard } from "@/components/news-card";
import { Pagination } from "@/components/pagination";
import { SearchForm } from "@/components/search-form";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";

const PAGE_SIZE = 9;

export const metadata = { title: "대시보드 · AI뉴스수집기" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string; q?: string }>;
}) {
  // 페이지는 proxy에서 막지 않으므로 여기서 직접 인증을 확인한다
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { category, page: pageParam, q: qParam } = await searchParams;
  const q = (qParam ?? "").trim().slice(0, 100);

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

  const categoryWhere =
    selected === "all"
      ? undefined
      : selected === "none"
        ? isNull(articles.categoryId)
        : eq(articles.categoryId, Number(selected));

  // LIKE 와일드카드는 이스케이프해 입력한 글자 그대로 찾는다
  const pattern = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
  const searchWhere = q
    ? or(
        ilike(articles.titleKo, pattern),
        ilike(articles.summaryKo, pattern),
        ilike(articles.originalTitle, pattern),
      )
    : undefined;
  const where = and(categoryWhere, searchWhere);

  // 카테고리·검색어를 적용한 전체 건수로 페이지 수를 계산하고, 범위를 벗어난 값은 보정한다
  const [{ total: filteredCount }] = await db
    .select({ total: count() })
    .from(articles)
    .where(where);
  const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
  const requested = Number.parseInt(pageParam ?? "1", 10);
  const page = Math.min(
    Math.max(Number.isNaN(requested) ? 1 : requested, 1),
    totalPages,
  );

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    if (selected !== "all") params.set("category", selected);
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/dashboard?${qs}` : "/dashboard";
  };

  const rows = await db
    .select({ article: articles, categoryName: categories.name })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(where)
    .orderBy(
      sql`${articles.publishedAt} desc nulls last`,
      desc(articles.fetchedAt),
      desc(articles.id),
    )
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              오늘의 AI 뉴스
            </h1>
            <span className="mt-2 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              총 {totalCount}개의 뉴스
            </span>
          </div>
          <FetchNewsButton />
        </div>

        <div className="mt-6">
          <SearchForm
            q={q}
            category={selected}
            clearHref={
              selected === "all" ? "/dashboard" : `/dashboard?category=${selected}`
            }
          />
        </div>

        <div className="mt-4">
          <CategoryBar chips={chips} selected={selected} q={q} />
        </div>

        {rows.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-zinc-300 py-16 text-center text-zinc-500 dark:border-zinc-700">
            {q
              ? `"${q}"에 해당하는 뉴스가 없어요.`
              : selected === "all"
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

        <Pagination page={page} totalPages={totalPages} hrefFor={hrefFor} />
      </main>
    </div>
  );
}
