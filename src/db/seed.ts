import { config } from "dotenv";

config({ path: ".env.local" });

const defaultCategories = [
  { name: "모델·제품", description: "새 AI 모델, 제품, 기능 출시와 업데이트" },
  { name: "투자·비즈니스", description: "투자 유치, 인수합병, 기업 전략, 시장 동향" },
  { name: "규제·정책", description: "AI 관련 법률, 규제, 정부 정책, 소송" },
  { name: "연구", description: "논문, 벤치마크, 기술 연구 성과" },
  { name: "기타", description: "위 분류에 해당하지 않는 AI 관련 소식" },
];

async function main() {
  // db 모듈은 import 시점에 DATABASE_URL을 읽으므로 dotenv 로드 후에 불러온다
  const { db } = await import("./index");
  const { categories } = await import("./schema");

  const inserted = await db
    .insert(categories)
    .values(defaultCategories)
    .onConflictDoNothing({ target: categories.name })
    .returning({ name: categories.name });

  console.log(`시드 완료: ${inserted.length}개 추가 (${defaultCategories.length - inserted.length}개는 이미 존재)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
