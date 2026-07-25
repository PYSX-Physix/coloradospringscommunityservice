import { getSession, buildSessionCookie, createSession } from "../../../lib/auth";
import { corsJson } from "../../../lib/cors";
import { rateLimit } from "../../../lib/rateLimit";
import { attachCSRFToSession } from "../../../lib/csrf";
import { decryptSecret } from "../../../lib/auth/encryption";
import { verifyTotpCode } from "../../../lib/auth/totp";
import { generateRecoveryCodes, hashRecoveryCode, matchRecoveryCode } from "../../../lib/auth/recovery";
import {
  getLoginChallenge,
  deleteLoginChallenge,
  recordFailedChallengeAttempt,
  challengeAttemptsExceeded,
} from "../../../lib/auth/challenge";

interface Env {
  DB: D1Database;
  Rate_Limits?: KVNamespace;
  TWO_FACTOR_ENCRYPTION_KEY: string;
}

type VerifyBody = {
  // Present when confirming setup or verifying an active login challenge.
  code?: string;
  // Present only for the login-challenge flow.
  challengeId?: string;
  recoveryCode?: string;
};

// POST /api/auth/2fa/verify
//
// Two modes, distinguished by payload shape:
//   1. Setup confirmation — authenticated session, no challengeId, { code }.
//      Turns on 2FA for the account and issues recovery codes.
//   2. Login-challenge verification — no session, { challengeId, code |
//      recoveryCode }. Redeems the challenge created by /api/auth/signin
//      and creates the authenticated session.
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  if (!env.TWO_FACTOR_ENCRYPTION_KEY) {
    console.error("TWO_FACTOR_ENCRYPTION_KEY is not configured");
    return corsJson(request, { error: "Internal server error" }, 500);
  }

  let body: VerifyBody;
  try {
    body = (await request.json()) as VerifyBody;
  } catch {
    return corsJson(request, { error: "Invalid request body" }, 400);
  }

  if (body.challengeId) {
    return handleLoginChallengeVerify(request, env, body);
  }

  return handleSetupConfirm(request, env, body);
}

async function handleSetupConfirm(request: Request, env: Env, body: VerifyBody) {
  const session = await getSession(env, request);
  if (!session) {
    return corsJson(request, { error: "Not authenticated" }, 401);
  }

  if (session.user.twoFactorEnabled) {
    return corsJson(request, { error: "Two-factor authentication is already enabled" }, 400);
  }

  const limitResponse = await rateLimit(request, env, {
    limit: 5,
    window: 300,
    keyPrefix: "2fa-setup-confirm",
  });
  if (limitResponse) return limitResponse;

  if (!body.code) {
    return corsJson(request, { error: "Verification code required" }, 400);
  }

  const userRow = await env.DB.prepare(
    `SELECT two_factor_secret FROM user WHERE id = ?`,
  ).bind(session.user.id).first<Record<string, unknown>>();

  if (!userRow?.two_factor_secret) {
    return corsJson(request, { error: "Start setup before verifying a code" }, 400);
  }

  const secretBase32 = await decryptSecret(String(userRow.two_factor_secret), env.TWO_FACTOR_ENCRYPTION_KEY);
  const isValid = verifyTotpCode(secretBase32, session.user.email, body.code);

  if (!isValid) {
    return corsJson(request, { error: "Invalid authentication code" }, 400);
  }

  const now = Date.now();
  await env.DB.prepare(
    `UPDATE user SET two_factor_enabled = 1, two_factor_enabled_at = ? WHERE id = ?`,
  ).bind(now, session.user.id).run();

  const recoveryCodes = await issueRecoveryCodes(env, session.user.id);

  return corsJson(request, {
    success: true,
    recoveryCodes,
  });
}

async function handleLoginChallengeVerify(request: Request, env: Env, body: VerifyBody) {
  const limitResponse = await rateLimit(request, env, {
    limit: 5,
    window: 300,
    keyPrefix: "2fa-login-verify",
  });
  if (limitResponse) return limitResponse;

  const challengeId = body.challengeId as string;
  const challenge = await getLoginChallenge(env, challengeId);

  if (!challenge) {
    return corsJson(request, { error: "Challenge expired" }, 400);
  }

  if (challengeAttemptsExceeded(challenge)) {
    await deleteLoginChallenge(env, challenge.id);
    return corsJson(request, { error: "Too many attempts" }, 429);
  }

  if (!body.code && !body.recoveryCode) {
    return corsJson(request, { error: "Authentication code or recovery code required" }, 400);
  }

  const user = await env.DB.prepare(
    `SELECT id, email, name, isAdmin, two_factor_secret FROM user WHERE id = ?`,
  ).bind(challenge.userId).first<Record<string, unknown>>();

  if (!user) {
    await deleteLoginChallenge(env, challenge.id);
    return corsJson(request, { error: "Challenge expired" }, 400);
  }

  let verified = false;

  if (body.code) {
    if (user.two_factor_secret) {
      const secretBase32 = await decryptSecret(String(user.two_factor_secret), env.TWO_FACTOR_ENCRYPTION_KEY);
      verified = verifyTotpCode(secretBase32, String(user.email), body.code);
    }
  } else if (body.recoveryCode) {
    const recoveryResult = await tryConsumeRecoveryCode(env, String(user.id), body.recoveryCode);
    if (recoveryResult === "reused") {
      await recordFailedChallengeAttempt(env, challenge.id);
      return corsJson(request, { error: "Recovery code already used" }, 400);
    }
    verified = recoveryResult === "ok";
  }

  if (!verified) {
    await recordFailedChallengeAttempt(env, challenge.id);
    return corsJson(request, { error: "Invalid authentication code" }, 400);
  }

  await deleteLoginChallenge(env, challenge.id);

  const { sessionId } = await createSession(env, request, String(user.id));
  const csrfToken = await attachCSRFToSession(env.DB, sessionId);

  return corsJson(
    request,
    {
      success: true,
      csrfToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: Number(user.isAdmin) === 1,
        twoFactorEnabled: true,
      },
    },
    200,
    { "Set-Cookie": buildSessionCookie(sessionId) },
  );
}

/** Generates, hashes, and persists a fresh set of recovery codes; returns the plaintext codes once. */
async function issueRecoveryCodes(env: Env, userId: string): Promise<string[]> {
  const codes = generateRecoveryCodes();
  const now = Date.now();

  await env.DB.prepare(`DELETE FROM recovery_codes WHERE user_id = ?`).bind(userId).run();

  for (const code of codes) {
    const id = crypto.randomUUID();
    const codeHash = await hashRecoveryCode(code);
    await env.DB.prepare(
      `INSERT INTO recovery_codes (id, user_id, code_hash, used, created_at) VALUES (?, ?, ?, 0, ?)`,
    ).bind(id, userId, codeHash, now).run();
  }

  return codes;
}

/** Attempts to redeem a recovery code. Distinguishes "wrong code" from "code already used". */
async function tryConsumeRecoveryCode(env: Env, userId: string, submitted: string): Promise<"ok" | "reused" | "invalid"> {
  const rows = await env.DB.prepare(
    `SELECT id, code_hash, used FROM recovery_codes WHERE user_id = ?`,
  ).bind(userId).all<Record<string, unknown>>();

  const candidates = (rows.results ?? []).map((r) => ({ id: String(r.id), codeHash: String(r.code_hash), used: Number(r.used) === 1 }));

  const match = await matchRecoveryCode(
    submitted,
    candidates.map((c) => ({ id: c.id, codeHash: c.codeHash })),
  );

  if (!match) return "invalid";

  const matched = candidates.find((c) => c.id === match.id);
  if (matched?.used) return "reused";

  await env.DB.prepare(`UPDATE recovery_codes SET used = 1 WHERE id = ?`).bind(match.id).run();
  return "ok";
}
