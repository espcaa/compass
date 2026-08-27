import type { APIRoute } from "astro";
import { UnlinkHackatimeForUser } from "../../../utils/admin";

export const POST: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const slackId = url.searchParams.get("slackId");
  if (!slackId) {
    return new Response("Missing slackId", { status: 400 });
  }
  await UnlinkHackatimeForUser(slackId);
  return new Response("User unlinked from Hackatime", { status: 200 });
};
