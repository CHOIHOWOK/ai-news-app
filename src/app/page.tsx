import { Show, UserButton } from "@clerk/nextjs";
import { SignInGate } from "@/components/sign-in-gate";

export default function Home() {
  return (
    <>
      <Show when="signed-out">
        <main className="flex flex-1 items-center justify-center px-6">
          <SignInGate />
        </main>
      </Show>
      <Show when="signed-in">
        <header className="flex items-center justify-between border-b border-black/10 px-6 py-3 dark:border-white/15">
          <span className="font-semibold">AI 뉴스 콜렉터</span>
          <UserButton />
        </header>
        <main className="flex flex-1 items-center justify-center px-6">
          <p className="text-zinc-600 dark:text-zinc-400">
            로그인되었습니다. 뉴스 카드는 곧 추가됩니다.
          </p>
        </main>
      </Show>
    </>
  );
}
