# AI뉴스수집기

해외 AI 뉴스를 RSS로 수집하고, Claude가 한국어로 번역·요약·카테고리 분류한 결과를 카드로 보여주는 개인용 웹 앱입니다. 마음에 드는 뉴스는 카드의 "뉴스저장" 버튼으로 Notion 데이터베이스에 저장할 수 있습니다. 요구사항 원본은 [`prd.md`](./prd.md), 화면 가이드는 [`ui.md`](./ui.md)입니다.

## 주요 기능

- **로그인**: Clerk 인증. 로그인하지 않으면 대시보드와 API에 접근할 수 없습니다.
- **뉴스 가져오기**: TechCrunch AI, The Verge AI 피드에서 최근 24시간 기사를 수집합니다. 피드 하나가 실패해도 나머지는 계속 처리하고, URL이 같은 기사는 중복 저장하지 않습니다.
- **번역·요약·분류**: 신규 기사를 Claude로 한 번에 배치 처리합니다. 처리에 실패한 기사는 원문으로 두었다가 다음 가져오기 때 재시도합니다.
- **카드 목록**: 카테고리 필터와 9개씩 페이지 나눔을 지원합니다.
- **Notion 저장**: "뉴스저장"을 누르면 Notion 데이터베이스에 페이지가 만들어지고, 버튼이 "저장된"으로 바뀝니다. 같은 기사는 다시 저장되지 않습니다.

아직 만들지 않은 것: 카테고리 추가·수정·삭제(CRUD).

## 기술 스택

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Clerk · Neon Postgres + Drizzle ORM · Anthropic SDK · rss-parser

## 시작하기

### 1. 설치

```bash
npm install
```

### 2. 환경 변수

프로젝트 루트에 `.env.local`을 만들고 아래 값을 채웁니다. 이 파일은 `.gitignore`에 포함되어 저장소에 올라가지 않습니다.

```bash
# Clerk (https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Neon Postgres (https://console.neon.tech)
DATABASE_URL=

# Anthropic Claude API (https://console.anthropic.com)
ANTHROPIC_API_KEY=

# 앱 베이스 URL (예: http://localhost:3000)
APP_URL=

# Notion 통합 토큰과 저장 대상 데이터베이스 ID
NOTION_API_TOKEN=
NOTION_DATABASE_ID=
```

### 3. 데이터베이스

```bash
npm run db:migrate   # 마이그레이션을 Neon에 적용
npm run db:seed      # 기본 카테고리 5개 삽입 (여러 번 실행해도 안전)
```

스키마(`src/db/schema.ts`)를 바꾼 뒤에는 `npm run db:generate`로 SQL을 만들고 `db:migrate`로 적용합니다.

### 4. Notion 설정

1. [notion.so/profile/integrations](https://www.notion.so/profile/integrations)에서 통합을 만들고 토큰을 `NOTION_API_TOKEN`에 넣습니다.
2. 아래 속성을 가진 데이터베이스를 만들고 ID를 `NOTION_DATABASE_ID`에 넣습니다.

   | 속성 | 종류 |
   |---|---|
   | 제목 | 제목(title) |
   | 날짜 | 날짜 |
   | 요약 | 텍스트 |
   | 출처 | URL |
   | 카테고리 | 선택(select) |

3. **데이터베이스의 `···` 메뉴 → 연결(Connections)에서 만든 통합을 추가합니다.** 공유하지 않으면 저장 시 404 오류가 납니다.

### 5. 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 로그인한 뒤 `/dashboard`에서 "뉴스 가져오기"를 누릅니다.

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` / `build` / `start` | 개발 서버 / 프로덕션 빌드 / 빌드 결과 실행 |
| `npm run lint` | ESLint |
| `npm run db:generate` / `db:migrate` / `db:push` | 마이그레이션 생성 / 적용 / 스키마 직접 반영 |
| `npm run db:studio` | Drizzle Studio |
| `npm run db:seed` | 기본 카테고리 삽입 |

테스트 러너는 설정되어 있지 않습니다.

## 폴더 구조

```
src/
├── app/
│   ├── page.tsx              로그인 게이트
│   └── dashboard/            대시보드(page.tsx)와 Server Action(actions.ts)
├── components/               뉴스 카드, 카테고리 바, 저장 버튼, 페이지 나눔 등
├── db/                       Drizzle 스키마, 클라이언트, 시드
├── lib/
│   ├── rss/                  피드 수집·파싱·저장
│   ├── ai/                   Claude 번역·요약·분류
│   └── notion/               Notion 저장
└── proxy.ts                  Clerk 인증 (Next 16의 middleware 대체)
drizzle/                      마이그레이션 SQL
```

## 참고

- 단일 사용자 앱이라 데이터는 사용자별로 나누지 않고 공유합니다.
- 비밀 값은 모두 서버에서만 사용하며 클라이언트에 노출하지 않습니다.
- 이 프로젝트의 Next.js는 기존 버전과 호환되지 않는 변경이 있습니다. 코드를 쓰기 전에 `node_modules/next/dist/docs/`의 가이드를 확인하세요.
