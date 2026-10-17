# PRD: AI 뉴스 수집기

## 1. 개요
해외 AI 뉴스를 RSS로 수집하고, Claude AI가 한국어로 번역·요약·카테고리 분류한 결과를 카드 형태로 보여주는 개인용 웹 앱. 마음에 드는 뉴스는 카드의 버튼으로 Notion에 저장할 수 있다.

## 2. 목표
- 해외 AI 뉴스를 한국어로 빠르게 훑어볼 수 있게 한다.
- 뉴스를 카테고리별로 자동 분류해 원하는 주제만 골라 본다.
- 선택한 뉴스를 Notion에 손쉽게 보관한다.

## 3. 사용자
- 나 혼자 사용하는 앱. Clerk 로그인으로 접근을 제한하고, 데이터는 사용자별 분리 없이 공용 구조로 둔다.

## 4. 뉴스 소스
| 소스 | RSS URL |
|---|---|
| TechCrunch AI | https://techcrunch.com/category/artificial-intelligence/feed/ |
| The Verge AI | https://www.theverge.com/rss/ai-artificial-intelligence/index.html |

## 5. 기능 요구사항
### F1. 로그인
- 앱 실행 시 로그인하지 않았다면 먼저 로그인해야 한다(Clerk).
- 모든 페이지와 API는 인증 후에만 접근 가능하다.

### F2. 뉴스 가져오기
- "뉴스 가져오기" 버튼을 누르면 두 RSS 피드를 수집한다(자동 주기 수집 없음, 필요할 때마다 수동).
- URL 기준으로 이미 저장된 기사는 제외하고 신규 기사만 처리한다.
- 신규 기사는 Claude API로 제목·내용을 한국어로 번역·요약하고, 카테고리를 분류해 저장한다.
- 한 피드가 실패해도 나머지는 계속 처리하고 결과(성공/실패 건수)를 사용자에게 알린다.

### F3. 카드 뉴스 목록
- 카드에 표시: 한국어 제목, 한국어 요약, 출처, 발행일, 카테고리 배지, 원문 링크, "Notion 저장" 버튼.
- 최신순으로 정렬한다.

### F4. 카테고리 분류 및 필터
- 가져온 뉴스는 자동으로 카테고리별로 분류된다.
- 분류는 현재 DB에 있는 카테고리 목록 중에서 Claude가 선택한다. 맞는 것이 없으면 "미분류".
- 카테고리를 선택하면 해당 뉴스만 볼 수 있다(전체 보기 포함).

### F5. 카테고리 관리
- 카테고리를 추가, 이름/설명 수정, 삭제할 수 있다. 나중에 언제든 변경 가능하다.
- 기본 카테고리를 초기 시드로 제공한다(예: 모델·제품, 투자·비즈니스, 규제·정책, 연구, 기타).
- 삭제된 카테고리의 기사는 "미분류"가 된다.
- 변경된 카테고리는 이후 가져오는 뉴스부터 분류에 반영된다. (선택) 미분류 기사 재분류 기능.

### F6. Notion 저장
- 각 카드의 "Notion 저장" 버튼으로 선택한 뉴스를 Notion에 저장한다.
- 저장 내용: 제목, 요약, 카테고리, 원문 URL.
- 저장 후 버튼은 "저장됨" 상태로 바뀌고 Notion 페이지 링크를 기록한다. 중복 저장은 방지한다.
- 연동 방식: 공식 원격 Notion MCP 서버(OAuth).

## 6. 비기능 요구사항
- 비밀키(Clerk, Anthropic, DB, Notion 토큰)는 환경변수/서버에서만 관리하고 클라이언트에 노출하지 않는다.
- Claude 호출은 신규 기사만 배치로 처리해 비용을 줄인다.
- 외부 서비스 오류(RSS, Claude, Notion)는 사용자에게 이해 가능한 메시지로 표시한다.

## 7. 기술 스택
| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js (App Router, TypeScript) |
| 로그인 | Clerk |
| 데이터베이스 | Neon (Postgres) + Drizzle ORM |
| 번역·요약·분류 | Claude API |
| Notion 저장 | Notion MCP 서버 (MCP 클라이언트: `@modelcontextprotocol/sdk`) |
| RSS 파싱 | `rss-parser` |

## 8. 데이터 모델
- **categories**: id, name(unique), description(분류 힌트), createdAt
- **articles**: id, sourceName, url(unique), originalTitle, author(nullable, 원문 작성자), titleKo, summaryKo, publishedAt, categoryId(FK, nullable=미분류), notionPageUrl(nullable), fetchedAt
- **notion_oauth**: Notion MCP OAuth 토큰/클라이언트 정보(단일 행)

## 9. 주요 흐름
1. 로그인 → 메인(카드 목록)
2. "뉴스 가져오기" → RSS 수집 → 중복 제거 → Claude 번역·요약·분류 → DB 저장 → 목록 갱신
3. 카테고리 칩 선택 → 해당 카테고리 뉴스만 표시
4. 설정에서 카테고리 추가/수정/삭제
5. "Notion 저장" → (최초 1회 OAuth 승인) → Notion 페이지 생성 → "저장됨" 표시

## 10. 구현 단계(제안)
1. 프로젝트 초기화 + Clerk 로그인
2. Neon + Drizzle 스키마/마이그레이션/카테고리 시드
3. RSS 수집 + Claude 번역·요약·분류 + 저장
4. 카드 UI + 카테고리 필터
5. 카테고리 CRUD
6. Notion MCP 연동(OAuth 포함) 및 저장 버튼

## 11. 범위 제외
- 다중 사용자/사용자별 데이터 분리
- 자동 주기 수집(스케줄러)
- 위 두 곳 외의 뉴스 소스 추가 UI

## 12. 미결 사항
- Notion 저장 대상(어느 데이터베이스/페이지에 저장할지)
- 사용할 Claude 모델
- 원격 Notion MCP OAuth 콜백 URL 및 토큰 갱신 처리 세부

## 13. 검증 기준
- 로그인 없이는 접근이 차단된다.
- "뉴스 가져오기" 후 한국어 요약과 카테고리 배지가 있는 카드가 생성되고, 재실행해도 중복이 없다.
- 카테고리 추가/삭제 후 필터와 분류가 반영된다.
- Notion 저장 시 실제 페이지가 생성되고 버튼이 "저장됨"으로 바뀐다.
