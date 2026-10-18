import Link from "next/link";

type CategoryChip = { key: string; name: string; count: number };

const base =
  "rounded-full px-3.5 py-1.5 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";
const idle =
  "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800";
const active = "bg-indigo-600 font-medium text-white";

// 전체 → 카테고리들 → 미분류 → 카테고리 추가 순서의 칩 목록
export function CategoryBar({
  chips,
  selected,
}: {
  chips: CategoryChip[];
  selected: string;
}) {
  return (
    <nav aria-label="카테고리" className="flex flex-wrap gap-2">
      {chips.map((chip) => {
        const isActive = chip.key === selected;
        return (
          <Link
            key={chip.key}
            href={chip.key === "all" ? "/dashboard" : `/dashboard?category=${chip.key}`}
            aria-current={isActive ? "page" : undefined}
            className={`${base} ${isActive ? active : idle}`}
          >
            {chip.name}
            <span
              className={`ml-1.5 text-xs ${isActive ? "text-indigo-100" : "text-zinc-500"}`}
            >
              {chip.count}
            </span>
          </Link>
        );
      })}
      {/* 카테고리 CRUD는 아직 구현 전이라 비활성 상태로 둔다 */}
      <button
        type="button"
        disabled
        title="카테고리 추가는 곧 제공됩니다"
        className={`${base} cursor-not-allowed border border-dashed border-zinc-300 text-zinc-500 dark:border-zinc-600`}
      >
        + 카테고리 추가
      </button>
    </nav>
  );
}
