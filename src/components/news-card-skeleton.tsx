// 뉴스 카드 로딩 스켈레톤 (ui.md §6): news-card.tsx와 같은 뼈대를 쓴다
export function NewsCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`flex animate-pulse flex-col rounded-xl border bg-white shadow-sm dark:bg-zinc-900 ${
        featured
          ? "border-zinc-200 border-l-4 border-l-indigo-200 p-6 sm:col-span-2 sm:p-8 lg:col-span-3 dark:border-zinc-800 dark:border-l-indigo-900"
          : "border-zinc-200 p-6 dark:border-zinc-800"
      }`}
    >
      {/* 상단: 출처 모노그램 + 출처명 / 날짜 */}
      <div className="flex items-center gap-3">
        <div className="size-9 shrink-0 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>

      {/* 제목 */}
      <div className={featured ? "mt-6 lg:max-w-3xl" : "mt-5"}>
        <div
          className={`w-full rounded bg-zinc-200 dark:bg-zinc-800 ${featured ? "h-8" : "h-6"}`}
        />
        <div
          className={`mt-2 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800 ${featured ? "h-8" : "h-6"}`}
        />
      </div>

      {/* 요약 */}
      <div
        className={`mt-4 flex-1 space-y-2.5 ${featured ? "lg:max-w-3xl" : ""}`}
      >
        <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* 하단: 카테고리 / 액션 */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="h-5 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-8 w-20 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
