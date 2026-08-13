import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  slackId: text("slack_id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatar: text("avatar").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const tokens = sqliteTable("tokens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slackId: text("slack_id")
    .notNull()
    .references(() => users.slackId, { onDelete: "cascade" }),
  token: text("token").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
