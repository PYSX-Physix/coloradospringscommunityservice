import { corsJson } from "../../lib/cors";
import { rateLimit } from "../../lib/rateLimit";

interface Env {
  DB: D1Database;
  Rate_Limits?: KVNamespace;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  
  const limitResponse = await rateLimit(request, env, {
    limit: 5,
    window: 60,
    keyPrefix: "signup",
  })

  if (limitResponse) return limitResponse;

  try {
    const { email, password, name } = (await request.json()) as { email?: string; password?: string; name?: string };

    if (!email || !password) {
      return corsJson(request, { error: "Email and password required" }, 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await env.DB.prepare("SELECT id FROM user WHERE email = ?").bind(normalizedEmail).first();
    if (existing) {
      return corsJson(request, { error: "User already exists" }, 400);
    }

    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();
    const now = Date.now();

    await env.DB.prepare(
      "INSERT INTO user (id, email, password_hash, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(userId, normalizedEmail, passwordHash, name?.trim() || null, now, now).run();

    return corsJson(request, {
      success: true,
      user: { id: userId, email: normalizedEmail, name: name?.trim() || null },
    }, 201);
  } catch (error) {
    console.error("Signup error", error);
    return corsJson(request, { error: "Internal server error" }, 500);
  }
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);

  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );

  const saltB64 = btoa(String.fromCharCode(...salt));
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));

  return `pbkdf2:${saltB64}:${hashB64}`;
}
