# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소에서 작업할 때 참고하는 지침이다.

@AGENTS.md

UI 작업(대시보드, 카드, 카테고리 바 등)을 하기 전에 `ui.md`를 읽고 그 가이드를 따른다.

## 프로젝트 현황

아직 만들지 않은 것: 카테고리 CRUD("+ 카테고리 추가" 버튼은 비활성). 요구사항의 기준 문서는 `prd.md`(한국어)이다. 구현은 PRD §10 순서를 따르되, 카드 UI는 RSS보다 먼저 만들어져 샘플 데이터로 동작했고, Notion 저장은 카테고리 CRUD보다 먼저 만들어졌다. PRD는 Notion MCP(OAuth)를 가정하지만 실제 구현은 아래처럼 Notion REST API와 통합 토큰을 쓴다. 처리에 실패한 기사는 원문으로 두었다가 다음 가져오기 때 재시도한다.

## 명령어

- 테스트 러너가 없으므로 변경 검증은 `npm run lint`·`npm run build`와 직접 실행으로 한다.
- `npm run db:seed` — 기본 카테고리 5개를 삽입한다(멱등). `npx tsx src/db/sample-articles.ts` — 가짜 `example.com` 기사 5건을 삽입한다(`url` 기준 멱등).
- drizzle-kit과 시드 스크립트는 dotenv로 `.env.local`에서 `DATABASE_URL`을 읽는다. `src/db/index.ts`는 값이 없으면 import 시점에 예외를 던지므로, 스크립트에서는 `config()` *이후에* `await import("./index")`를 해야 한다(`seed.ts` 참고).
- 새 기능은 `/news-workflow <브랜치이름>`(`.claude/commands/news-workflow.md`)으로 시작한다. 커밋 전 검토 기준은 `.claude/skills/convention-check/conventions.md`이다.

## 코드 구조

- `src/db/schema.ts` — 테이블 `categories`, `articles`, `notion_oauth`(단일 행, CHECK로 `id = 1` 강제). `articles.categoryId`는 `ON DELETE SET NULL`이다(null = 미분류). 스키마는 여기서 바꾼 뒤 `db:generate` + `db:migrate`를 실행한다.
- `src/proxy.ts` — `middleware.ts`를 대체하는 Next 16 방식의 파일이며 Clerk를 처리한다. 페이지는 그대로 통과시키고(로그인은 `app/page.tsx`의 `<Show when="signed-out|signed-in">` + `components/sign-in-gate.tsx`에서 처리), `/api`와 `/trpc` 라우트는 `auth.protect()`로 보호하므로 새 API 라우트는 자동으로 401을 반환한다.
- `src/app/dashboard/page.tsx` — 서버 컴포넌트. 페이지는 proxy가 막지 않으므로 `auth()`로 직접 확인하고 없으면 `/`로 redirect한다. 카테고리 필터는 `?category=<id|none>` 쿼리이며(없는 값은 전체), 키워드 검색은 `?q=`(100자 제한, 제목·요약·원제목 `ilike`, `components/search-form.tsx`)로 카테고리·페이지 나눔과 함께 유지된다. Drizzle로 직접 조회한다(`publishedAt desc nulls last`). 페이지 나눔은 `?page=<n>`(9개씩, `components/pagination.tsx`)이다. `components/category-bar.tsx`(링크 칩)와 `components/news-card.tsx`를 사용한다.
- `src/lib/rss/fetch-news.ts` — 피드별 독립 처리, 24시간 필터, `url` 충돌 시 무시하는 삽입. 신규 기사와 `aiProcessedAt`이 null인 기사를 `src/lib/ai/`로 Claude 배치 처리한다. `src/app/dashboard/actions.ts`의 Server Action이 `auth()` 확인 후 호출한다. 같은 파일의 `deleteArticleAction`은 기사 한 건을 삭제하며 UI는 `components/delete-news-button.tsx`이다.
- `src/lib/notion/save-article.ts` — `NOTION_API_TOKEN`/`NOTION_DATABASE_ID` 환경 변수로 Notion REST API(`/v1/pages`)를 `fetch`로 호출해 기사 한 건을 페이지(제목·날짜·요약·출처·카테고리)로 만들고 `articles.notionPageUrl`에 기록한다. 이미 저장된 기사는 다시 만들지 않는다. `actions.ts`의 `saveToNotionAction`이 호출하며, UI는 `components/save-news-button.tsx`이다.
- `src/lib/ai/` — `client.ts`(Anthropic 클라이언트)와 `enrich.ts`(모델 `claude-opus-5-5`, 번역·요약·분류).
- `.mcp.json` — Neon MCP 서버를 등록한다(프로젝트 id `silent-base-45009213`).

## 아키텍처 메모 (PRD 기준)

- 모든 페이지와 API 라우트는 Clerk 인증이 필요하다. 단일 사용자 앱이며 데이터는 사용자별이 아니라 공유한다.
- 모든 비밀 값(Clerk, Anthropic, DB, Notion 토큰)은 환경 변수로 서버에만 둔다. `.env.local`의 변수: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`(Clerk가 자동으로 읽음), `DATABASE_URL`, `ANTHROPIC_API_KEY`(Anthropic SDK가 기본으로 읽음), `NOTION_API_TOKEN`, `NOTION_DATABASE_ID`. `APP_URL`도 정의되어 있으나 `src/`에서는 참조하지 않는다.
- 가져오기 흐름: 수동 "뉴스 가져오기" → 두 피드를 독립적으로 파싱(하나가 실패해도 다른 쪽을 막지 않고, 성공/실패 건수를 보고) → 고유 `url`로 중복 제거 → 신규 기사만 모아 Claude를 한 번 배치 호출 → 저장.
- Claude는 현재 DB에 있는 카테고리 중에서 분류한다. 맞는 것이 없거나 카테고리가 삭제되었으면 `categoryId = null`("미분류").
- Notion 저장: 통합 토큰(`NOTION_API_TOKEN`)과 대상 데이터베이스 ID(`NOTION_DATABASE_ID`)를 환경 변수로 쓰는 REST API 호출이며, 대상 데이터베이스에 통합을 연결(Connections)해야 한다. `articles.notionPageUrl`로 중복 저장을 막는다. `notion_oauth` 테이블은 스키마에 있지만 현재 쓰이지 않는다(OAuth/MCP는 채택하지 않음).

## 환경 특이사항

- 앱 이름은 "AI뉴스수집기"(붙여 씀)가 표준이다. `layout.tsx`, `page.tsx`, `sign-in-gate.tsx`에는 아직 옛 표기 "AI 뉴스 콜렉터"가 남아 있다(`ui.md` §2).
- 디렉터리 이름 `AI-News_Collecotr`에 대문자가 있어 제자리에서 `create-next-app`을 실행할 수 없다. npm 패키지 이름은 `ai-news-collector`이다.
- 이 폴더는 git 저장소이다(`main`이 메인 브랜치이고, Clerk 인증 같은 기능 작업은 `auth` 같은 브랜치에서 한다).
- `AGENTS.md`는 이 Next.js 버전에 호환되지 않는 변경이 있다고 경고한다. Next.js 코드를 쓰기 전에 `node_modules/next/dist/docs/`의 관련 가이드를 읽는다.
