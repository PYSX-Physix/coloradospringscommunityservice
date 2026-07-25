import { getSession } from "../../../lib/auth";
import { corsJson } from "../../../lib/cors";
import { rateLimit } from "../../../lib/rateLimit";
import { verifyPassword } from "../../../lib/auth/password";
import { generateRecoveryCodes, hashRecoveryCode } from "../../../lib/auth/recovery";

interface Env {
  DB: D1Database;
  Rate_Limits?: KVNamespace;
}

// GET /api/auth/2fa/recovery — how many unused recovery codes remain.
export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;

  const session = await getSession(env, request);
  if (!session) {
    return corsJson(request, { error: "Not authenticated" }, 401);
  }
  if (!session.user.twoFactorEnabled) {
    return corsJson(request, { error: "Two-factor authentication is not enabled" }, 400);
  }

  const row = await env.DB.prepare(
    `SELECT COUNT(*) as remaining FROM recovery_codes WHERE user_id = ? AND used = 0`,
  ).bind(session.user.id).first<Record<string, unknown>>();

  return corsJson(request, { remaining: Number(row?.remaining ?? 0) });
}

type RegenerateBody = {
  password?: string;
};

// POST /api/auth/2fa/recovery — regenerate recovery codes.
// Requires password confirmation; invalidates all previously issued codes.
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  const limitResponse = await rateLimit(request, env, {
    limit: 5,
    window: 300,
    keyPrefix: "2fa-recovery-regen",
  });
  if (limitResponse) return limitResponse;

  try {
    const session = await getSession(env, request);
    if (!session) {
      return corsJson(request, { error: "Not authenticated" }, 401);
    }
    if (!session.user.twoFactorEnabled) {
      return corsJson(request, { error: "Two-factor authentication is not enabled" }, 400);
    }

    const { password } = (await request.json()) as RegenerateBody;
    if (!password) {
      return corsJson(request, { error: "Current password is required" }, 400);
    }

    const userRow = await env.DB.prepare(`SELECT password_hash FROM user WHERE id = ?`)
      .bind(session.user.id)
      .first<Record<string, unknown>>();

    if (!userRow) {
      return corsJson(request, { error: "User not found" }, 404);
    }

    const passwordValid = await verifyPassword(password, String(userRow.password_hash));
    if (!passwordValid) {
      return corsJson(request, { error: "Current password is incorrect" }, 401);
    }

    const codes = generateRecoveryCodes();
    const now = Date.now();

    const statements = [
      env.DB.prepare(`DELETE FROM recovery_codes WHERE user_id = ?`).bind(session.user.id),
      ...(await Promise.all(
        codes.map(async (code) => {
          const id = crypto.randomUUID();
          const codeHash = await hashRecoveryCode(code);
          return env.DB.prepare(
            `INSERT INTO recovery_codes (id, user_id, code_hash, used, created_at) VALUES (?, ?, ?, 0, ?)`,
          ).bind(id, session.user.id, codeHash, now);
        }),
      )),
    ];

    await env.DB.batch(statements);

    return corsJson(request, { success: true, recoveryCodes: codes });
  } catch (error) {
    console.error("2FA recovery regenerate error", error);
    return corsJson(request, { error: "Internal server error" }, 500);
  }
}
