import { defineMiddleware } from "astro:middleware";
import { ValidateToken } from "./utils/auth";

const PROTECTED_PREFIX = "/admin";
const whitelistedUsers = ["U05MKEZUY67"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (!pathname.startsWith(PROTECTED_PREFIX)) {
    return next();
  }

  console.log("admin request in progress beep");

  const token = context.cookies.get("hackrail_token")?.value;

  if (!token) {
    return context.redirect("/401");
  }

  const verificationResponse = await ValidateToken(token);

  if (
    verificationResponse?.ok &&
    whitelistedUsers.includes(verificationResponse.value?.slackid)
  ) {
    return next();
  }

  return context.redirect("/403");
});
