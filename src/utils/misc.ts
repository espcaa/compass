import { eq } from "drizzle-orm";
import { db } from "../db";
import { projects } from "../db/schema";

export async function GetProjectsForUser(slackId: string) {
  return db
    .select()
    .from(projects)
    .where(eq(projects.authorSlackId, slackId))
    .all();
}
