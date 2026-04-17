import { buildClearedSessionCookie, deleteSession, parseCookies } from "../../lib/auth";
import { corsJson } from "../../lib/cors";

interface Env {
  DB: D1Database;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  const sessionId = parseCookies(request).get("session");
  if (sessionId) {
    await deleteSession(env, sessionId);
  }

  return corsJson(request, { success: true }, 200, {
    "Set-Cookie": buildClearedSessionCookie(),
  });
}
