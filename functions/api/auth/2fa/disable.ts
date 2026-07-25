import { getSession } from "../../../lib/auth";
import { corsJson } from "../../../lib/cors";
import { rateLimit } from "../../../lib/rateLimit";
import { verifyPassword } from "../../../lib/auth/password";
import { decryptSecret } from "../../../lib/auth/encryption";
import { verifyTotpCode } from "../../../lib/auth/totp";
import { matchRecoveryCode } from "../../../lib/auth/recovery";

interface Env {
  DB: D1Database;
  Rate_Limits?: KVNamespace;
  TWO_FACTOR_ENCRYPTION_KEY: string;
}

type DisableBody = {
  password?: string;
  code?: string;
  recoveryCode?: string;
};

// POST /api/auth/2fa/disable — turn 2FA off.
// Requires the current password AND a valid TOTP code (a recovery code is
// also accepted as a fallback for users who've lost their authenticator).
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  const limitResponse = await rateLimit(request, env, {
    limit: 5,
    window: 300,
    keyPrefix: "2fa-disable",
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

    const { password, code, recoveryCode } = (await request.json()) as DisableBody;

    if (!password) {
      return corsJson(request, { error: "Current password is required" }, 400);
    }
    if (!code && !recoveryCode) {
      return corsJson(request, { error: "Current authentication code is required" }, 400);
    }
    if (!env.TWO_FACTOR_ENCRYPTION_KEY) {
      console.error("TWO_FACTOR_ENCRYPTION_KEY is not configured");
      return corsJson(request, { error: "Internal server error" }, 500);
    }

    const userRow = await env.DB.prepare(
      `SELECT password_hash, two_factor_secret FROM user WHERE id = ?`,
    ).bind(session.user.id).first<Record<string, unknown>>();

    if (!userRow) {
      return corsJson(request, { error: "User not found" }, 404);
    }

    const passwordValid = await verifyPassword(password, String(userRow.password_hash));
    if (!passwordValid) {
      return corsJson(request, { error: "Current password is incorrect" }, 401);
    }

    let codeValid = false;

    if (code && userRow.two_factor_secret) {
      const secretBase32 = await decryptSecret(String(userRow.two_factor_secret), env.TWO_FACTOR_ENCRYPTION_KEY);
      codeValid = verifyTotpCode(secretBase32, session.user.email, code);
    } else if (recoveryCode) {
      const rows = await env.DB.prepare(
        `SELECT id, code_hash FROM recovery_codes WHERE user_id = ? AND used = 0`,
      ).bind(session.user.id).all<Record<string, unknown>>();
      const candidates = (rows.results ?? []).map((r) => ({ id: String(r.id), codeHash: String(r.code_hash) }));
      const match = await matchRecoveryCode(recoveryCode, candidates);
      codeValid = match !== null;
    }

    if (!codeValid) {
      return corsJson(request, { error: "Invalid authentication code" }, 400);
    }

    await env.DB.batch([
      env.DB.prepare(
        `UPDATE user SET two_factor_enabled = 0, two_factor_secret = NULL, two_factor_enabled_at = NULL WHERE id = ?`,
      ).bind(session.user.id),
      env.DB.prepare(`DELETE FROM recovery_codes WHERE user_id = ?`).bind(session.user.id),
      env.DB.prepare(`DELETE FROM trusted_devices WHERE user_id = ?`).bind(session.user.id),
    ]);

    return corsJson(request, { success: true });
  } catch (error) {
    console.error("2FA disable error", error);
    return corsJson(request, { error: "Internal server error" }, 500);
  }
}
