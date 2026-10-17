import { config } from "dotenv";

config({ path: ".env.local" });

const samples = [
  {
    sourceName: "TechCrunch AI",
    url: "https://example.com/techcrunch/open-weight-reasoning-model",
    originalTitle: "Startup unveils open-weight reasoning model that runs on a single GPU",
    author: "Maya Collins",
    titleKo: "스타트업, 단일 GPU에서 구동되는 오픈 웨이트 추론 모델 공개",
    summaryKo:
      "한 스타트업이 소비자용 GPU 한 장으로 돌아가는 오픈 웨이트 추론 모델을 공개했다. 수학·코딩 벤치마크에서 더 큰 모델에 근접한 성능을 보였다고 밝혔고, 가중치와 학습 레시피를 허용적 라이선스로 배포한다. 개인 개발자와 소규모 팀의 로컬 AI 활용이 넓어질 전망이다.",
    publishedAt: new Date("2026-10-15T09:30:00Z"),
    category: "모델·제품",
  },
  {
    sourceName: "The Verge AI",
    url: "https://example.com/verge/ai-chip-raises-800m",
    originalTitle: "AI chip maker raises $800M as demand for inference hardware surges",
    author: "Daniel Reyes",
    titleKo: "AI 반도체 업체, 추론 하드웨어 수요 급증 속 8억 달러 투자 유치",
    summaryKo:
      "AI 추론용 반도체를 설계하는 업체가 8억 달러 규모 투자를 유치했다. 서비스 단계에서 추론 비용이 급증하면서 학습용이 아닌 추론 전용 칩 수요가 커졌다는 분석이다. 조달 자금은 양산 확대와 데이터센터 고객 확보에 쓰일 예정이다.",
    publishedAt: new Date("2026-10-14T17:05:00Z"),
    category: "투자·비즈니스",
  },
  {
    sourceName: "TechCrunch AI",
    url: "https://example.com/techcrunch/eu-ai-political-ads-labels",
    originalTitle: "EU lawmakers advance rules requiring labels on AI-generated political ads",
    author: "Sofia Lindqvist",
    titleKo: "EU 의회, AI 생성 정치 광고 표시 의무화 규정 추진",
    summaryKo:
      "EU 의회 위원회가 AI로 만든 정치 광고에 명확한 표시를 의무화하는 조항을 통과시켰다. 위반 시 광고주와 플랫폼에 과징금이 부과될 수 있다. 본회의 표결과 회원국 협의를 거쳐야 하며, 시행은 내년 이후로 예상된다.",
    publishedAt: new Date("2026-10-14T11:20:00Z"),
    category: "규제·정책",
  },
  {
    sourceName: "The Verge AI",
    url: "https://example.com/verge/coding-agent-benchmark",
    originalTitle: "New benchmark finds coding agents still struggle with long-running tasks",
    author: null,
    titleKo: "새 벤치마크, 코딩 에이전트는 장시간 작업에 여전히 취약",
    summaryKo:
      "연구진이 수 시간 걸리는 소프트웨어 작업을 평가하는 새 벤치마크를 발표했다. 코딩 에이전트는 짧은 과제에서는 높은 점수를 냈지만, 작업이 길어질수록 맥락을 잃고 오류가 누적되는 경향이 확인됐다. 장기 기억과 자체 검증이 향후 과제로 지목됐다.",
    publishedAt: new Date("2026-10-13T20:45:00Z"),
    category: "연구",
  },
  {
    sourceName: "The Verge AI",
    url: "https://example.com/verge/smart-glasses-ai-assistant",
    originalTitle: "Smart glasses maker teases always-on AI assistant for next spring",
    author: "Priya Nair",
    titleKo: "스마트 안경 업체, 내년 봄 상시 작동 AI 비서 예고",
    summaryKo:
      "스마트 안경 제조사가 내년 봄 출시할 제품에 상시 작동하는 AI 비서를 넣겠다고 예고했다. 카메라와 마이크로 주변 상황을 이해해 길 안내나 번역을 돕는다는 구상이다. 프라이버시 우려와 배터리 지속 시간이 관건으로 꼽힌다.",
    publishedAt: new Date("2026-10-12T14:10:00Z"),
    category: null,
  },
];

async function main() {
  const { db } = await import("./index");
  const { articles, categories } = await import("./schema");

  const cats = await db.select().from(categories);
  const idByName = new Map(cats.map((c) => [c.name, c.id]));

  const rows = samples.map(({ category, ...rest }) => ({
    ...rest,
    categoryId: category ? (idByName.get(category) ?? null) : null,
  }));

  const inserted = await db
    .insert(articles)
    .values(rows)
    .onConflictDoNothing({ target: articles.url })
    .returning({ id: articles.id });

  console.log(`예제 기사 ${inserted.length}개 추가 (${rows.length - inserted.length}개는 이미 존재)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
