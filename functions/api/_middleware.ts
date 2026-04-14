import { corsJson, handleCorsPreflight, isCorsOriginAllowed, buildCorsHeaders } from "../lib/cors";
import { getSession, needsCsrfValidation, validateCsrf } from "../lib/auth";

interface Env {
  DB: D1Database;
}

export async function onRequest(context: EventContext<Env, string, unknown>) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return handleCorsPreflight(request);
  }

  if (!isCorsOriginAllowed(request)) {
    return corsJson(request, { error: "Origin not allowed" }, 403);
  }

  const path = url.pathname;
  const isAdminRoute = path.startsWith("/api/admin/");
  const isAuthBootstrapRoute = path === "/api/auth/signin" || path === "/api/auth/signup" || path === "/api/auth/session";

  const session = await getSession(env, request);

  if (isAdminRoute) {
    if (!session) {
      return corsJson(request, { error: "Unauthorized" }, 401);
    }
    if (!session.user.isAdmin) {
      return corsJson(request, { error: "Admin access required" }, 403);
    }
  }

  if (!isAuthBootstrapRoute && session && needsCsrfValidation(request)) {
    if (!validateCsrf(session, request)) {
      return corsJson(request, { error: "Invalid CSRF token" }, 403);
    }
  }

  const response = await context.next();
  const corsHeaders = buildCorsHeaders(request);
  corsHeaders.forEach((value, key) => response.headers.set(key, value));
  return response;
}
