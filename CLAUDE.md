# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project status

Only the bare `create-next-app` scaffold exists (Next.js 16, React 19, Tailwind 4, App Router, `src/` dir, alias `@/*`). No app code has been written yet. `prd.md` is the source of truth for requirements (written in Korean): an AI news collector that pulls RSS (TechCrunch AI, The Verge AI), has Claude translate/summarize/categorize into Korean, shows cards, and saves to Notion. Build in the order of PRD §10 (Clerk → Neon+Drizzle → RSS+Claude → card UI → category CRUD → Notion MCP).

Planned stack not yet installed: Clerk, Neon (Postgres) + Drizzle ORM, Claude API, `rss-parser`, `@modelcontextprotocol/sdk` (remote Notion MCP over OAuth).

## Commands

- `npm run dev` — dev server (Turbopack)
- `npm run build` / `npm start` — production build / serve
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)
- No test runner is configured.

## Architecture notes (from PRD)

- Every page and API route must require Clerk auth; single-user app with shared (not per-user) data.
- All secrets (Clerk, Anthropic, DB, Notion tokens) stay server-side in env vars.
- Fetch flow: manual "뉴스 가져오기" → parse both feeds independently (one failing must not block the other, report success/failure counts) → dedupe by unique `url` → one batched Claude call for new articles only → store.
- Claude classifies into the categories currently in the DB; no match or deleted category → `categoryId = null` ("미분류").
- Notion save: MCP client with OAuth; tokens persisted in a single-row `notion_oauth` table; prevent duplicate saves via `articles.notionPageUrl`.
- Open decisions in PRD §12: Notion target database/page, Claude model, OAuth callback/token refresh details.

## Environment quirks

- Directory name `AI-News_Collecotr` contains capitals, so `create-next-app` can't run in place; the npm package name is `ai-news-collector`.
- The folder is not a git repository.
- `AGENTS.md` warns this Next.js version has breaking changes — read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code.
