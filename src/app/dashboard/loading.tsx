import { NewsCardSkeleton } from "@/components/news-card-skeleton";

const SKELETON_COUNT = 6;

export default function Loading() {
  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">
            AI뉴스수집기
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          오늘의 AI 뉴스
        </h1>
        <div
          role="status"
          aria-label="뉴스를 불러오는 중"
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
