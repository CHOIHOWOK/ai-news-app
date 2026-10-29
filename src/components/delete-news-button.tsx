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
      className={`-mr-1 flex size-10 items-center justify-center rounded-lg border-2 text-2xl font-bold leading-none transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 ${
        error
          ? "border-red-700 bg-red-200 text-red-800 dark:border-red-400 dark:bg-red-900 dark:text-red-200"
          : "border-red-500 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white dark:border-red-500 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
      }`}
    >
      ✕
    </button>
  );
}
