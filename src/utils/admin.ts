import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, projects } from "../db/schema";

export function GetAllUsers() {
  return db.select().from(users).all();
}

export function GetAllProjects() {
  return db.select().from(projects).all();
}

export async function UnlinkHackatimeForUser(slackId: string) {
  return db
    .update(users)
    .set({ hackatimeLinked: 0, hackatimeToken: "" })
    .where(eq(users.slackId, slackId))
    .run();
}

export function GetUserFromSlackId(slackId: string) {
  return db.select().from(users).where(eq(users.slackId, slackId)).get();
}
