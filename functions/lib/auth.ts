interface Env {
  DB: D1Database;
}

const SESSION_COOKIE_NAME = "session";
const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7;
const SEVEN_DAYS_MS = SEVEN_DAYS_SECONDS * 1000;

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
};

export type SessionRecord = {
  id: string;
  userId: string;
  csrfToken: string;
  createdAt: number;
  expiresAt: number;
  ip: string | null;
  userAgent: string | null;
  user: AuthenticatedUser;
};

export function generateSecureToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function parseCookies(request: Request): Map<string, string> {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const cookies = new Map<string, string>();

  for (const pair of cookieHeader.split(";")) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex <= 0) continue;
    const name = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim();
    cookies.set(name, value);
  }

  return cookies;
}

export function buildSessionCookie(sessionId: string): string {
  return `${SESSION_COOKIE_NAME}=${sessionId}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${SEVEN_DAYS_SECONDS}`;
}

export function buildClearedSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0`;
}

function getClientIp(request: Request): string | null {
  return request.headers.get("CF-Connecting-IP") ?? request.headers.get("X-Forwarded-For");
}

export async function createSession(env: Env, request: Request, userId: string): Promise<{ sessionId: string; csrfToken: string; expiresAt: number }> {
  const sessionId = generateSecureToken(48);
  const csrfToken = generateSecureToken(32);
  const createdAt = Date.now();
  const expiresAt = createdAt + SEVEN_DAYS_MS;
  const ip = getClientIp(request);
  const userAgent = request.headers.get("User-Agent");

  await env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(userId).run();

  await env.DB.prepare(
    `INSERT INTO sessions (id, user_id, csrf_token, created_at, expires_at, ip, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(sessionId, userId, csrfToken, createdAt, expiresAt, ip, userAgent).run();

  return { sessionId, csrfToken, expiresAt };
}

export async function deleteSession(env: Env, sessionId: string): Promise<void> {
  await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run();
}

export async function getSession(env: Env, request: Request): Promise<SessionRecord | null> {
  const sessionId = parseCookies(request).get(SESSION_COOKIE_NAME);
  if (!sessionId) {
    return null;
  }

  const result = await env.DB.prepare(
    `SELECT
      s.id,
      s.user_id,
      s.csrf_token,
      s.created_at,
      s.expires_at,
      s.ip,
      s.user_agent,
      u.email,
      u.name,
      u.isAdmin
     FROM sessions s
     JOIN user u ON u.id = s.user_id
     WHERE s.id = ?`
  ).bind(sessionId).first<Record<string, unknown>>();

  if (!result) {
    return null;
  }

  const expiresAt = Number(result.expires_at);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    await deleteSession(env, sessionId);
    return null;
  }

  return {
    id: String(result.id),
    userId: String(result.user_id),
    csrfToken: String(result.csrf_token),
    createdAt: Number(result.created_at),
    expiresAt,
    ip: result.ip ? String(result.ip) : null,
    userAgent: result.user_agent ? String(result.user_agent) : null,
    user: {
      id: String(result.user_id),
      email: String(result.email),
      name: result.name ? String(result.name) : null,
      isAdmin: Number(result.isAdmin) === 1,
    },
  };
}

export function getCsrfTokenFromHeader(request: Request): string | null {
  return request.headers.get("X-CSRF-Token");
}

export function needsCsrfValidation(request: Request): boolean {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(request.method.toUpperCase());
}

export function validateCsrf(session: SessionRecord, request: Request): boolean {
  const provided = getCsrfTokenFromHeader(request);
  if (!provided) {
    return false;
  }

  const a = new TextEncoder().encode(session.csrfToken);
  const b = new TextEncoder().encode(provided);
  if (a.length !== b.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }

  return diff === 0;
}
