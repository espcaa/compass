import { eq } from "drizzle-orm";
import { db } from "../db";
import { projects, type Project } from "../db/schema";

export async function GetProjectFromId(id: string): Promise<Project | null> {
  const numericId = typeof id === "string" ? parseInt(id, 10) : id;

  if (isNaN(numericId)) return null;

  const result = db
    .select()
    .from(projects)
    .where(eq(projects.id, numericId))
    .get();

  return result ?? null;
}
