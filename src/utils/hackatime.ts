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
