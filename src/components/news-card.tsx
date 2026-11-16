import type { Article } from "@/db/schema";
import { DeleteNewsButton } from "@/components/delete-news-button";
import { SaveNewsButton } from "@/components/save-news-button";

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// 7일 이내는 상대 표기, 그 외는 2026.10.18 형식
function formatDate(date: Date) {
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days < 1) return "오늘";
  if (days < 7) return `${days}일 전`;
  return dateFormat.format(date).replace(/\.\s/g, ".").replace(/\.$/, "");
}

export function NewsCard({
  article,
  categoryName,
  featured = false,
}: {
  article: Article;
  categoryName: string | null;
  featured?: boolean;
}) {
  const date = article.publishedAt;
  const initial = article.sourceName.trim().charAt(0).toUpperCase() || "?";

  return (
    <article
      className={`group relative flex flex-col rounded-xl border bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg focus-within:border-indigo-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:bg-zinc-900 dark:hover:border-indigo-500/60 dark:focus-within:border-indigo-500/60 ${
        featured
          ? "border-zinc-200 border-l-4 border-l-indigo-600 p-6 sm:col-span-2 sm:p-8 lg:col-span-3 dark:border-zinc-800 dark:border-l-indigo-500"
          : "border-zinc-200 p-6 dark:border-zinc-800"
      }`}
    >
      {/* 상단: 출처(모노그램 + 이름 + 날짜) / 삭제 */}
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-sm font-bold text-white transition-colors group-hover:bg-indigo-600 dark:bg-zinc-100 dark:text-zinc-900 dark:group-hover:bg-indigo-500 dark:group-hover:text-white"
          >
            {initial}
          </span>
          <div className="min-w-0 leading-tight">
            <p
              className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              title={article.sourceName}
            >
              {article.sourceName}
            </p>
            {date && (
              <time
                dateTime={date.toISOString()}
                className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400"
              >
                {formatDate(date)}
              </time>
            )}
          </div>
        </div>
        <DeleteNewsButton articleId={article.id} />
      </div>

      {/* 제목: 링크를 카드 전체로 늘려 카드 어디를 눌러도 원문이 열린다 */}
      <h3
        className={`break-keep font-bold leading-snug tracking-tight text-zinc-900 decoration-indigo-500 decoration-2 underline-offset-4 transition-colors group-hover:text-indigo-700 dark:text-zinc-50 dark:group-hover:text-indigo-300 ${
          featured
            ? "mt-6 line-clamp-3 text-2xl sm:text-3xl lg:max-w-3xl"
            : "mt-5 line-clamp-3 text-xl"
        }`}
      >
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-sm after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none"
        >
          {article.titleKo}
        </a>
      </h3>

      <p
        className={`mt-3 flex-1 break-keep text-zinc-600 dark:text-zinc-400 ${
          featured
            ? "line-clamp-4 text-base leading-8 lg:max-w-3xl"
            : "line-clamp-4 text-[15px] leading-7"
        }`}
      >
        {article.summaryKo}
      </p>

      {/* 하단: 카테고리 / 액션 */}
      <div className="relative z-10 mt-6 flex items-center justify-between gap-3">
        <span
          className={`min-w-0 truncate rounded-full px-2.5 py-0.5 text-xs font-medium ${
            categoryName
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          {categoryName ?? "미분류"}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md px-1 text-sm font-medium text-indigo-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-indigo-400"
          >
            원문 보기
            <span
              aria-hidden
              className="inline-block transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
            >
              {" "}
              ↗
            </span>
          </a>
          <SaveNewsButton
            articleId={article.id}
            notionPageUrl={article.notionPageUrl}
          />
        </div>
      </div>
    </article>
  );
}
