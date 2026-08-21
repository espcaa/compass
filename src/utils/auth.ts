import { db } from "../db/index.ts";
import { tokens, users } from "../db/schema.ts";
import { eq } from "drizzle-orm";
import { type Result, type UserProfile } from "../shared/types.ts";
import { createHash, randomUUID } from "crypto";

export async function GenerateToken(slackId: string): Promise<string> {
  const token = randomUUID();
  const hashedToken = hashToken(token);

  await db.insert(tokens).values({
    slackId,
    token: hashedToken,
    createdAt: new Date(),
  });

  return token;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function ValidateToken(
  token: string,
): Promise<Result<UserProfile>> {
  const hashedToken = hashToken(token);

  console.log(JSON.stringify(token), hashedToken);

  const row = db
    .select()
    .from(tokens)
    .where(eq(tokens.token, hashedToken))
    .get();

  if (!row) {
    return { ok: false, error: new Error("invalid token") };
  }

  // find the user

  const userProfile = await GetUserProfileBySlackId(row.slackId);

  if (!userProfile.ok) {
    return { ok: false, error: new Error("invalid user") };
  }

  return { ok: true, value: userProfile.value };
}

export async function RevokeToken(token: string): Promise<Result<void>> {
  const hashedToken = hashToken(token);

  const row = db
    .select()
    .from(tokens)
    .where(eq(tokens.token, hashedToken))
    .get();

  if (!row) {
    return { ok: false, error: new Error("invalid token") };
  }

  await db.delete(tokens).where(eq(tokens.token, hashedToken));

  return { ok: true, value: undefined };
}

export async function GetUserProfileBySlackId(
  slackId: string,
): Promise<Result<UserProfile>> {
  const userRow = db
    .select()
    .from(users)
    .where(eq(users.slackId, slackId))
    .get();

  if (!userRow) {
    return { ok: false, error: new Error("user not found") };
  }

  const userProfile: UserProfile = {
    slackid: userRow.slackId,
    name: userRow.name,
    email: userRow.email,
    avatar: userRow.avatar,
  };

  return {
    ok: true,
    value: userProfile,
  };
}
