import { buildSessionCookie, createSession } from "../../lib/auth";
import { corsJson } from "../../lib/cors";
import { getRequestIp, rateLimit } from "../../lib/rateLimit";

interface Env {
  DB: D1Database;
  RATE_LIMIT_KV?: KVNamespace;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  const ip = getRequestIp(request);
  const loginRateLimit = await rateLimit(env, {
    key: `rate_limit:signin:${ip}`,
    limit: 5,
    windowSeconds: 60,
  });

  if (!loginRateLimit.allowed) {
    return corsJson(request, { error: "Too many login attempts" }, 429, {
      "Retry-After": String(loginRateLimit.retryAfterSeconds),
    });
  }

  try {
    const { email, password } = (await request.json()) as { email?: string; password?: string };

    if (!email || !password) {
      return corsJson(request, { error: "Email and password required" }, 400);
    }

    const user = await env.DB.prepare(
      "SELECT id, email, name, password_hash, isAdmin FROM user WHERE email = ?"
    ).bind(email.toLowerCase()).first<Record<string, unknown>>();

    if (!user) {
      return corsJson(request, { error: "Invalid credentials" }, 401);
    }

    const passwordValid = await verifyPassword(password, String(user.password_hash));
    if (!passwordValid) {
      return corsJson(request, { error: "Invalid credentials" }, 401);
    }

    const { sessionId, csrfToken } = await createSession(env, request, String(user.id));

    return corsJson(request, {
      success: true,
      csrfToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: Number(user.isAdmin) === 1,
      },
    }, 200, {
      "Set-Cookie": buildSessionCookie(sessionId),
    });
  } catch (error) {
    console.error("Signin error", error);
    return corsJson(request, { error: "Internal server error" }, 500);
  }
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (storedHash.startsWith("pbkdf2:")) {
    const [, saltB64, hashB64] = storedHash.split(":");
    const encoder = new TextEncoder();

    const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
    const expectedHash = Uint8Array.from(atob(hashB64), c => c.charCodeAt(0));

    const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
    const derivedBuffer = await crypto.subtle.deriveBits({
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    }, keyMaterial, 256);

    const derivedHash = new Uint8Array(derivedBuffer);
    if (derivedHash.length !== expectedHash.length) return false;

    let diff = 0;
    for (let i = 0; i < derivedHash.length; i++) {
      diff |= derivedHash[i] ^ expectedHash[i];
    }
    return diff === 0;
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const legacyHash = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return legacyHash === storedHash;
}
