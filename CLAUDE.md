# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소에서 작업할 때 참고하는 지침이다.

@AGENTS.md

UI 작업(대시보드, 카드, 카테고리 바 등)은 `ui.md`의 가이드를 따른다.

@ui.md

## 프로젝트 현황

Next.js 16, React 19, Tailwind 4, App Router, `src/` 디렉터리, 별칭 `@/*`. 지금까지 완료된 것: Clerk 인증(`/`의 로그인 모달 게이트), Neon 프로젝트 `ai-news`의 `neondb` 데이터베이스에 적용된 Neon + Drizzle 스키마/마이그레이션, 샘플 기사 5건. 아직 만들지 않은 것: RSS 가져오기, Claude 요약, 카드 UI, 카테고리 CRUD, Notion MCP. 요구사항의 기준 문서는 `prd.md`(한국어)이다. 내용은 RSS(TechCrunch AI, The Verge AI)를 가져와 Claude가 한국어로 번역·요약·카테고리 분류하고, 카드로 보여주며, Notion에 저장하는 AI 뉴스 수집기이다. 구현은 PRD §10 순서(Clerk → Neon+Drizzle → RSS+Claude → 카드 UI → 카테고리 CRUD → Notion MCP)를 따른다.

## 명령어

- `npm run dev` / `build` / `start` / `lint` — 테스트 러너는 설정되어 있지 않다.
- `npm run db:generate`(스키마 → `drizzle/`의 SQL), `db:migrate`(Neon에 적용), `db:push`, `db:studio`.
- `npm run db:seed` — 기본 카테고리 5개를 삽입한다(멱등). `npx tsx src/db/sample-articles.ts` — 가짜 `example.com` 기사 5건을 삽입한다(`url` 기준 멱등).
- drizzle-kit과 시드 스크립트는 dotenv로 `.env.local`에서 `DATABASE_URL`을 읽는다. `src/db/index.ts`는 값이 없으면 import 시점에 예외를 던지므로, 스크립트에서는 `config()` *이후에* `await import("./index")`를 해야 한다(`seed.ts` 참고).

## 코드 구조

- `src/db/schema.ts` — 테이블 `categories`, `articles`, `notion_oauth`(단일 행, CHECK로 `id = 1` 강제). `articles.categoryId`는 `ON DELETE SET NULL`이다(null = 미분류). 스키마는 여기서 바꾼 뒤 `db:generate` + `db:migrate`를 실행한다.
- `src/db/index.ts` — `@neondatabase/serverless`(neon-http 드라이버) 기반 Drizzle 클라이언트.
- `src/proxy.ts` — `middleware.ts`를 대체하는 Next 16 방식의 파일이며 Clerk를 처리한다. 페이지는 그대로 통과시키고(로그인은 `app/page.tsx`의 `<Show when="signed-out|signed-in">` + `components/sign-in-gate.tsx`에서 처리), `/api`와 `/trpc` 라우트는 `auth.protect()`로 보호하므로 새 API 라우트는 자동으로 401을 반환한다.
- `.mcp.json` — Neon MCP 서버를 등록한다(프로젝트 id `silent-base-45009213`).

## 아키텍처 메모 (PRD 기준)

- 모든 페이지와 API 라우트는 Clerk 인증이 필요하다. 단일 사용자 앱이며 데이터는 사용자별이 아니라 공유한다.
- 모든 비밀 값(Clerk, Anthropic, DB, Notion 토큰)은 환경 변수로 서버에만 둔다.
- 가져오기 흐름: 수동 "뉴스 가져오기" → 두 피드를 독립적으로 파싱(하나가 실패해도 다른 쪽을 막지 않고, 성공/실패 건수를 보고) → 고유 `url`로 중복 제거 → 신규 기사만 모아 Claude를 한 번 배치 호출 → 저장.
- Claude는 현재 DB에 있는 카테고리 중에서 분류한다. 맞는 것이 없거나 카테고리가 삭제되었으면 `categoryId = null`("미분류").
- Notion 저장: OAuth를 쓰는 MCP 클라이언트. 토큰은 단일 행 `notion_oauth` 테이블에 보관하고, `articles.notionPageUrl`로 중복 저장을 막는다.
- PRD §12의 미결정 사항: Notion 대상 데이터베이스/페이지, Claude 모델, OAuth 콜백 및 토큰 갱신 세부 방식.

## 환경 특이사항

- 디렉터리 이름 `AI-News_Collecotr`에 대문자가 있어 제자리에서 `create-next-app`을 실행할 수 없다. npm 패키지 이름은 `ai-news-collector`이다.
- 이 폴더는 git 저장소이다(`main`이 메인 브랜치이고, Clerk 인증 같은 기능 작업은 `auth` 같은 브랜치에서 한다).
- `AGENTS.md`는 이 Next.js 버전에 호환되지 않는 변경이 있다고 경고한다. Next.js 코드를 쓰기 전에 `node_modules/next/dist/docs/`의 관련 가이드를 읽는다.
