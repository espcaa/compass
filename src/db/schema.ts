import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  slackId: text("slack_id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatar: text("avatar").notNull(),
  hackatimeLinked: integer("is_hackatime_linked").notNull().default(0),
  hackatimeToken: text("hackatime_token").notNull().default(""),
  shipped: integer("shipped").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  authorSlackId: text("author_slack_id")
    .notNull()
    .references(() => users.slackId, { onDelete: "cascade" }),
  image: text("image").default(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Den_Haag_Hollands_Spoor.jpg/3840px-Den_Haag_Hollands_Spoor.jpg",
  ),
  githubUrl: text("github_url").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  hackatimeProjects: text("hackatime_projects").notNull(),
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
export type Project = typeof projects.$inferSelect;
