"use client";

import { SignInButton, useClerk } from "@clerk/nextjs";
import { useEffect } from "react";

// 접속 시 로그인 모달을 자동으로 띄우고, 닫아도 다시 열 수 있는 버튼을 제공한다.
export function SignInGate() {
  const { loaded, openSignIn } = useClerk();

  useEffect(() => {
    if (loaded) openSignIn();
  }, [loaded, openSignIn]);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">AI 뉴스 콜렉터</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        계속하려면 로그인이 필요합니다.
      </p>
      <SignInButton mode="modal">
        <button
          type="button"
          className="h-11 rounded-full bg-foreground px-6 font-medium text-background transition-colors hover:opacity-80"
        >
          로그인
        </button>
      </SignInButton>
    </div>
  );
}
