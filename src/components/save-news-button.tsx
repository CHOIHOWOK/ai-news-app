"use client";

import { useState, useTransition } from "react";
import { saveToNotionAction } from "@/app/dashboard/actions";

export function SaveNewsButton({
  articleId,
  notionPageUrl,
}: {
  articleId: number;
  notionPageUrl: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(!!notionPageUrl);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await saveToNotionAction(articleId);
        if (result.ok) setSaved(true);
        else setError(result.error);
      } catch {
        setError("Notion에 저장하지 못했어요");
      }
    });
  }

  if (saved) {
    return (
      <button
        type="button"
        disabled
        className="cursor-default rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
      >
        저장된
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {pending ? "저장 중…" : "뉴스저장"}
      </button>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
