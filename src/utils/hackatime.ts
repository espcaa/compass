import { GetUserProfileBySlackId } from "./auth";

export async function HackatimeLogin(code: string): Promise<{
  ok: boolean;
  token?: string;
  error?: Error;
}> {
  try {
    const response = await fetch("https://hackatime.hackclub.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: import.meta.env.PUBLIC_HACKATIME_CLIENT_ID,
        client_secret: import.meta.env.HACKATIME_CLIENT_SECRET,
        redirect_uri: import.meta.env.PUBLIC_HACKATIME_REDIRECT_URI,
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

    return { ok: true, token };
  } catch (error) {
    return { ok: false, error: error as Error };
  }
}

export type HackatimeProject = {
  name: string;
  total_seconds: number;
};

type HackatimeProjectsResponse = {
  projects: {
    name: string;
    total_seconds: number;
    most_recent_heartbeat: string | null;
    languages: string[];
    archived: boolean;
  }[];
};

export async function GetHackatimeProjects(slackId: string): Promise<{
  ok: boolean;
  projects?: HackatimeProject[];
  error?: Error;
}> {
  try {
    const userProfile = await GetUserProfileBySlackId(slackId);
    if (!userProfile.ok) {
      return { ok: false, error: userProfile.error };
    }

    // start is 1 aug
    const start = new Date("2026-08-01T00:00:00Z").toISOString();
    const end = new Date().toISOString();

    const response = await fetch(
      "https://hackatime.hackclub.com/api/v1/authenticated/projects?include_archived=false&start=" +
        encodeURIComponent(start) +
        "&end=" +
        encodeURIComponent(end),
      {
        headers: {
          Authorization: `Bearer ${userProfile.value.hackatimeToken}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        ok: false,
        error: new Error(
          `dang it we got a http error. status: ${response.status}, message: ${errorText}`,
        ),
      };
    }

    const data: HackatimeProjectsResponse = await response.json();

    const projects = data.projects
      .filter((p) => !p.archived)
      .map((p) => ({
        name: p.name,
        total_seconds: p.total_seconds,
      }));

    return { ok: true, projects };
  } catch (error) {
    return { ok: false, error: error as Error };
  }
}
