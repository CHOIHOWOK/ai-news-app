import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  // Claude가 분류할 때 참고하는 힌트
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    sourceName: text("source_name").notNull(),
    // 중복 제거 기준
    url: text("url").notNull().unique(),
    originalTitle: text("original_title").notNull(),
    // RSS에 작성자가 없을 수 있어 nullable
    author: text("author"),
    titleKo: text("title_ko").notNull(),
    summaryKo: text("summary_ko").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    // null = 미분류 (카테고리 삭제 시에도 null로 돌아감)
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    // 값이 있으면 이미 Notion에 저장된 기사
    notionPageUrl: text("notion_page_url"),
    fetchedAt: timestamp("fetched_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("articles_published_at_idx").on(t.publishedAt.desc()),
    index("articles_category_id_idx").on(t.categoryId),
  ],
);

// 단일 행 테이블 (id = 1)
export const notionOauth = pgTable(
  "notion_oauth",
  {
    id: integer("id").primaryKey().default(1),
    clientInformation: jsonb("client_information"),
    tokens: jsonb("tokens"),
    codeVerifier: text("code_verifier"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [check("notion_oauth_single_row", sql`${t.id} = 1`)],
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
