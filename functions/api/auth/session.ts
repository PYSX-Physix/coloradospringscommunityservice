import { getSession } from "../../lib/auth";
import { corsJson } from "../../lib/cors";

interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const session = await getSession(context.env, context.request);

  if (!session) {
    return corsJson(context.request, { session: null });
  }

  return corsJson(context.request, {
    session: {
      id: session.id,
      user: session.user,
      csrfToken: session.csrfToken,
      expiresAt: session.expiresAt,
    },
  });
}
