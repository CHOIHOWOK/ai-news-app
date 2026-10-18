# UI 가이드 — AI뉴스수집기

메인 화면(대시보드)과 공통 스타일 규칙을 정의한다. 요구사항의 원본은 `prd.md`, 이 문서는 화면 구현 시 따르는 시각·구조 가이드다. 스타일은 **Tailwind CSS 4** 유틸리티 클래스로만 작성한다(별도 CSS 파일 추가 지양).

## 1. 디자인 원칙

- **깔끔하게**: 흰 배경, 얇은 테두리, 약한 그림자. 장식 요소는 쓰지 않는다.
- **읽기 편하게**: 본문은 넉넉한 줄 간격과 충분한 여백, 한 줄 길이를 제한한다.
- **한 가지 강조색**: 인디고 계열 하나만 포인트로 쓰고 나머지는 zinc 회색 톤.
- **다크 모드 지원**: 이미 `prefers-color-scheme`으로 동작하므로 모든 색 클래스에 `dark:` 짝을 둔다.

## 2. 앱 이름·표기

- 앱 이름은 **"AI뉴스수집기"** (붙여 쓴다). 헤더 로고, `metadata.title`, 로그인 화면 문구에 동일하게 쓴다.
- 현재 코드에는 "AI 뉴스 콜렉터"가 남아 있다(`src/app/layout.tsx`, `src/app/page.tsx`). 대시보드 작업 시 함께 교체한다.

## 3. 디자인 토큰

### 색상 (Tailwind 기본 팔레트)

| 용도 | 라이트 | 다크 |
|---|---|---|
| 페이지 배경 | `bg-zinc-50` | `dark:bg-zinc-950` |
| 카드/헤더 배경 | `bg-white` | `dark:bg-zinc-900` |
| 테두리 | `border-zinc-200` | `dark:border-zinc-800` |
| 제목 텍스트 | `text-zinc-900` | `dark:text-zinc-50` |
| 본문 텍스트 | `text-zinc-600` | `dark:text-zinc-400` |
| 보조 텍스트(출처·날짜) | `text-zinc-500` | `dark:text-zinc-500` |
| 포인트(버튼·선택됨) | `bg-indigo-600 text-white` (hover `bg-indigo-500`) | 동일 |
| 오류 | `text-red-600` | `dark:text-red-400` |

> 참고: `globals.css`의 `--background`는 `#ffffff`다. 대시보드는 `main` 래퍼에 `bg-zinc-50 dark:bg-zinc-950`을 직접 지정해 카드가 배경에서 살짝 떠 보이게 한다.

### 타이포그래피

- 폰트: 한글 가독성을 위해 `font-sans`(Geist) 뒤에 시스템 한글 폰트가 폴백되도록 둔다. `body`의 `Arial` 하드코딩은 `font-sans`로 바꾼다.
- 카드 제목: `text-lg font-semibold leading-snug`
- 카드 요약: `text-[15px] leading-7` (한글 본문은 줄 간격을 넉넉히)
- 메타 정보: `text-xs`
- 페이지 제목: `text-2xl font-bold tracking-tight`

### 형태

- 카드 모서리 `rounded-xl`, 칩/배지 `rounded-full`, 버튼 `rounded-lg`
- 그림자 `shadow-sm`, 카드 hover 시 `hover:shadow-md`
- 전환 `transition` (색·그림자만, 움직임 효과 없음)

## 4. 메인 화면 구조

```
┌──────────────────────────────────────────────────────┐
│ 헤더  AI뉴스수집기                         [사용자 UserButton] │
├──────────────────────────────────────────────────────┤
│ 페이지 영역 (max-w-6xl, 가운데 정렬)                         │
│                                                      │
│  오늘의 AI 뉴스                        [뉴스 가져오기]      │
│  총 24건 · 마지막 수집 10:32                              │
│                                                      │
│  (전체) (모델·제품) (투자·비즈니스) (규제·정책) (연구) (미분류) (+ 카테고리 추가) │
│                                                      │
│  ┌────────┐ ┌────────┐ ┌────────┐                    │
│  │ 카드   │ │ 카드   │ │ 카드   │                    │
│  └────────┘ └────────┘ └────────┘                    │
│  ┌────────┐ ┌────────┐ ┌────────┐                    │
│  │ 카드   │ │ 카드   │ │ 카드   │                    │
│  └────────┘ └────────┘ └────────┘                    │
└──────────────────────────────────────────────────────┘
```

세로 순서: **헤더 → 페이지 제목 줄 → 카테고리 바 → 카드 그리드**. 카테고리는 반드시 카드 목록 *위*에 둔다.

### 4.1 헤더

- 상단 고정(`sticky top-0 z-10`), 반투명 배경 + 하단 테두리.
- 좌측: 앱 이름 "AI뉴스수집기" (`text-base font-bold`). 우측: Clerk `UserButton`.

```tsx
<header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
  <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
    <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">AI뉴스수집기</span>
    <UserButton />
  </div>
</header>
```

### 4.2 페이지 제목 줄

- 좌측: 제목 + 보조 문구(건수, 마지막 수집 시각). 우측: **"뉴스 가져오기"** 기본(포인트) 버튼.
- 가져오는 중에는 버튼을 `disabled`로 하고 라벨을 "가져오는 중…"으로 바꾼다.
- 결과(피드별 성공/실패 건수)는 제목 줄 아래에 한 줄의 `text-sm` 메시지로 보여준다. 실패가 있으면 오류 색.
- 모바일에서는 제목 아래로 버튼이 내려가도록 `flex-col sm:flex-row`.

### 4.3 카테고리 바 (카드 목록 위)

가로로 나열되는 **칩(chip)** 형태. 맨 앞은 "전체", 맨 끝은 **카테고리 추가 버튼**.

순서: `전체` → DB의 카테고리들 → `미분류` → `+ 카테고리 추가`

- 컨테이너: `flex flex-wrap gap-2` (모바일에서도 줄바꿈으로 모두 보이게 하고, 가로 스크롤은 쓰지 않는다).
- 칩 하나: 이름 + 건수(선택). 선택 상태가 한눈에 구분되어야 한다.

| 상태 | 클래스 |
|---|---|
| 기본 | `rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800` |
| 선택됨 | `rounded-full bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white` |
| 카테고리 추가 | `rounded-full border border-dashed border-zinc-300 px-3.5 py-1.5 text-sm text-zinc-500 hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-600` |

- 선택된 칩에는 `aria-pressed="true"`를 둔다. 칩은 `<button>`으로 만든다.
- "카테고리 추가" 버튼은 **칩 목록의 맨 끝**에 항상 위치하며 라벨은 `+ 카테고리 추가`. 클릭하면 이름(필수)·설명(선택)을 입력하는 작은 모달 또는 인라인 입력으로 연결한다(CRUD 구현은 별도 단계).
- 카테고리 수정/삭제는 칩 우클릭이나 별도 설정 화면에서 처리하며, 칩 자체는 단순하게 유지한다. 삭제된 카테고리의 기사는 "미분류"로 보인다.

### 4.4 뉴스 카드 그리드

- 그리드: `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`
- 카드 사이 간격 `gap-4`(모바일 1열 → 태블릿 2열 → 데스크톱 3열).

## 5. 뉴스 카드

PRD F3의 표시 항목: 한국어 제목, 한국어 요약, 출처, 발행일, 카테고리 배지, 원문 링크, "Notion 저장" 버튼.

```
┌──────────────────────────────────┐
│ [모델·제품]              TechCrunch · 2일 전 │  ← 상단: 카테고리 배지 / 출처·날짜
│                                  │
│ 한국어 제목이 여기에 두 줄까지 표시됩니다   │  ← 제목 (line-clamp-2)
│                                  │
│ 한국어 요약 본문. 세 줄에서 말줄임 처리…    │  ← 요약 (line-clamp-4)
│                                  │
│ ───────────────────────────────  │
│ 원문 보기 ↗                [Notion 저장]  │  ← 하단 액션
└──────────────────────────────────┘
```

```tsx
<article className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
  <div className="flex items-center justify-between gap-2">
    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
      모델·제품
    </span>
    <span className="text-xs text-zinc-500">TechCrunch · 2일 전</span>
  </div>
  <h3 className="mt-3 line-clamp-2 text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-50">제목</h3>
  <p className="mt-2 line-clamp-4 flex-1 text-[15px] leading-7 text-zinc-600 dark:text-zinc-400">요약</p>
  <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
    <a className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400" href="…" target="_blank" rel="noopener noreferrer">원문 보기 ↗</a>
    <button className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Notion 저장</button>
  </div>
</article>
```

규칙:

- **카테고리 배지**: 카테고리가 없으면(`categoryId = null`) "미분류"를 회색 배지(`bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400`)로 표시한다.
- **날짜**: 7일 이내는 상대 표기("2일 전"), 그 외는 `2026.10.18` 형식. `<time dateTime>`을 사용한다.
- **원문 링크**는 새 탭, `rel="noopener noreferrer"`.
- **Notion 저장 버튼 상태**: 기본 / 저장 중(`disabled`, "저장 중…") / 저장됨(`notionPageUrl` 있음 → "Notion에서 보기 ↗" 링크로 대체, 중복 저장 방지) / 실패(버튼 아래 `text-xs` 오류 문구).
- 카드 높이는 내용에 맞추되 같은 줄 카드는 `flex-1` 요약 영역 덕분에 하단 액션이 정렬된다.

## 6. 상태 화면

| 상태 | 표현 |
|---|---|
| 로딩 | 카드 모양 스켈레톤 6개 (`animate-pulse`, `bg-zinc-200 dark:bg-zinc-800` 막대) |
| 빈 목록(전체) | 가운데 정렬 안내 + "뉴스 가져오기" 버튼. 예: "아직 수집된 뉴스가 없어요." |
| 빈 목록(카테고리 선택 중) | "이 카테고리에는 뉴스가 없어요." + "전체 보기" 링크 |
| 오류 | 카드 영역 위에 `rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300` 알림 |

빈 상태 컨테이너: `rounded-xl border border-dashed border-zinc-300 py-16 text-center text-zinc-500 dark:border-zinc-700`.

## 7. 반응형·접근성

- 컨테이너: `mx-auto w-full max-w-6xl px-4 sm:px-6`, 세로 여백 `py-8`.
- 브레이크포인트: 기본(모바일 1열) / `sm`(2열) / `lg`(3열).
- 모든 버튼·링크에 키보드 포커스 표시: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500`.
- 색만으로 상태를 전달하지 않는다(선택된 칩은 색 + `aria-pressed`, 오류는 색 + 문구).
- 터치 대상은 높이 최소 36px 이상(`py-1.5 text-sm` 이상 유지).
- 본문 대비는 WCAG AA 이상(위 토큰 조합 기준).

## 8. 구현 메모

- 대시보드는 `src/app/page.tsx`의 `<Show when="signed-in">` 영역에 만든다. 로그인 전 화면(`sign-in-gate.tsx`)은 그대로 둔다.
- 컴포넌트는 `src/components/`에 둔다. 제안: `news-card.tsx`, `category-bar.tsx`, `fetch-news-button.tsx`.
- 카테고리 선택은 URL 쿼리(`?category=<id>`)로 유지하면 서버 컴포넌트에서 필터링하기 쉽고 새로고침에도 유지된다.
- Next.js 16 규칙이 기존과 다르므로 코드 작성 전 `node_modules/next/dist/docs/`의 관련 가이드를 확인한다(`AGENTS.md`).
