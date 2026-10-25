"use client";

import { useState, useTransition } from "react";
import { fetchNewsAction } from "@/app/dashboard/actions";
import type { AiResult, FeedResult } from "@/lib/rss/fetch-news";

type Result = { feeds: FeedResult[]; ai?: AiResult; error?: string };

export function FetchNewsButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<Result | null>(null);

  function handleClick() {
    startTransition(async () => {
      try {
        setResult(await fetchNewsAction());
      } catch {
        setResult({ feeds: [], error: "뉴스를 가져오지 못했어요" });
      }
    });
  }

  const hasFailure =
    !!result &&
    (!!result.error || result.feeds.some((f) => !f.ok) || !!result.ai?.failed);
  const totalInserted = result?.feeds.reduce((sum, f) => sum + f.inserted, 0) ?? 0;

  return (
    <div className="flex flex-col items-start sm:items-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "가져오는 중…" : "뉴스 가져오기"}
      </button>
      {result && !pending && (
        <p
          role="status"
          className={`mt-2 text-sm ${
            hasFailure
              ? "text-red-600 dark:text-red-400"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          {result.error ??
            `신규 ${totalInserted}건 · ` +
              result.feeds
                .map((f) =>
                  f.ok
                    ? `${f.source} 성공(${f.inserted}건)`
                    : `${f.source} 실패`,
                )
                .join(", ") +
              (result.ai && result.ai.processed + result.ai.failed > 0
                ? ` · 번역·분류 ${result.ai.processed}건` +
                  (result.ai.failed
                    ? `, 실패 ${result.ai.failed}건(원문 유지, 다음에 재시도)`
                    : "")
                : "")}
        </p>
      )}
    </div>
  );
}
