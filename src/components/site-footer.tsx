export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 text-xs text-zinc-500 sm:px-6 dark:text-zinc-500">
        <span>© {new Date().getFullYear()} AI뉴스수집기</span>
        <span>AI 뉴스를 한국어로 요약합니다</span>
      </div>
    </footer>
  );
}
