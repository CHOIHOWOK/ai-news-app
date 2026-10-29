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
}: {
  article: Article;
  categoryName: string | null;
}) {
  const date = article.publishedAt;
  return (
    <article className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            categoryName
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          {categoryName ?? "미분류"}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">
            {article.sourceName}
            {date && (
              <>
                {" · "}
                <time dateTime={date.toISOString()}>{formatDate(date)}</time>
              </>
            )}
          </span>
          <DeleteNewsButton articleId={article.id} />
        </div>
      </div>
      <h3 className="mt-3 line-clamp-2 text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
        {article.titleKo}
      </h3>
      <p className="mt-2 line-clamp-4 flex-1 text-[15px] leading-7 text-zinc-600 dark:text-zinc-400">
        {article.summaryKo}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-indigo-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-indigo-400"
        >
          원문 보기 ↗
        </a>
        <SaveNewsButton
          articleId={article.id}
          notionPageUrl={article.notionPageUrl}
        />
      </div>
    </article>
  );
}
