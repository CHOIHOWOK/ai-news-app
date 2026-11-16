"use client";

import { useState, useTransition } from "react";
import { deleteArticleAction } from "@/app/dashboard/actions";

export function DeleteNewsButton({ articleId }: { articleId: number }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!window.confirm("이 뉴스를 삭제할까요?")) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await deleteArticleAction(articleId);
        if (!result.ok) setError(result.error);
      } catch {
        setError("삭제하지 못했어요");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label="뉴스 삭제"
      title={error ?? "뉴스 삭제"}
      className={`-mr-2 flex size-9 items-center justify-center rounded-lg text-base leading-none transition focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 ${
        error
          ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
          : "text-zinc-400 hover:bg-red-50 hover:text-red-600 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-within:opacity-100 dark:text-zinc-500 dark:hover:bg-red-950 dark:hover:text-red-400"
      }`}
    >
      ✕
    </button>
  );
}
