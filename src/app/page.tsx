import { Show, UserButton } from "@clerk/nextjs";
import { SignInGate } from "@/components/sign-in-gate";
import { SiteFooter } from "@/components/site-footer";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <Show when="signed-out">
        <ThemeToggle className="fixed top-3 right-4 z-20 sm:right-6" />
        <main className="flex flex-1 items-center justify-center px-6">
          <SignInGate />
        </main>
      </Show>
      <Show when="signed-in">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              AI뉴스수집기
            </span>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <UserButton />
            </div>
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center px-6">
          <p className="text-zinc-600 dark:text-zinc-400">
            로그인되었습니다. 뉴스 카드는 곧 추가됩니다.
          </p>
        </main>
      </Show>
      <SiteFooter />
    </div>
  );
}
