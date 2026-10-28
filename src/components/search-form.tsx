import Link from "next/link";

// GET 폼이라 검색 버튼 클릭과 Enter 키 모두 같은 URL 쿼리(?q=)로 이동한다
export function SearchForm({
  q,
  category,
  clearHref,
}: {
  q: string;
  category: string;
  clearHref: string;
}) {
  return (
    <form
      action="/dashboard"
      method="get"
      role="search"
      className="flex flex-col gap-2 sm:flex-row"
    >
      {category !== "all" && (
        <input type="hidden" name="category" value={category} />
      )}
      <input
        type="search"
        name="q"
        defaultValue={q}
        placeholder="키워드로 뉴스 검색"
        aria-label="키워드 검색"
        className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          검색
        </button>
        {q && (
          <Link
            href={clearHref}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            초기화
          </Link>
        )}
      </div>
    </form>
  );
}
