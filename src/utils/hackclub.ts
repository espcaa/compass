import { db } from "../db/index";
import { users } from "../db/schema";
import { type Result, type UserProfile } from "../shared/types";
import { GenerateToken } from "./auth";

// Login takes a hackclub oauth code & returns a hackrail token
async function Login(code: string): Promise<Result<string>> {
  try {
    const response = await fetch("https://auth.hackclub.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: import.meta.env.PUBLIC_CLIENT_ID,
        client_secret: import.meta.env.CLIENT_SECRET,
        redirect_uri: import.meta.env.PUBLIC_REDIRECT_URI,
        code: code,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        ok: false,
        error: new Error(
          `dang it we got a http error. status: ${response.status}, message: ${errorText}`,
        ),
      };
    }

    const data = await response.json();
    const token = data.access_token;

    if (!token) {
      return { ok: false, error: new Error("gng we don't have a token what") };
    }

    // now that we have a token, we can use it to get the user's profile

    const profileResponse = await fetch("https://auth.hackclub.com/api/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      return {
        ok: false,
        error: new Error(
          `dang it we got a http error when fetching profile. status: ${profileResponse.status}, message: ${errorText}`,
        ),
      };
    }

    const profileData = await profileResponse.json();
    const profile: UserProfile = {
      slackid: profileData.identity.slack_id,
      name: profileData.identity.first_name,
      email: profileData.identity.primary_email,
      avatar:
        "https://cachet.dunkirk.sh/users/" +
        profileData.identity.slack_id +
        "/r",
    };

    // now we can use the profile to get a hackrail token
    await upsertUser(profile);

    const hackrailtoken = await GenerateToken(profile.slackid);

    return { ok: true, value: hackrailtoken };
  } catch (error) {
    return { ok: false, error: error as Error };
  }
}

async function upsertUser(profile: UserProfile) {
  const [row] = await db
    .insert(users)
    .values({
      slackId: profile.slackid,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar,
    })
    .onConflictDoUpdate({
      target: users.slackId,
      set: { name: profile.name, email: profile.email, avatar: profile.avatar },
    })
    .returning();

  return row;
}

export { Login };
