// Login challenges bridge the gap between "password verified" and
// "session created" when 2FA is enabled. No session cookie is issued until
// the challenge is redeemed with a valid TOTP or recovery code.

interface Env {
  DB: D1Database;
}

const CHALLENGE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CHALLENGE_ATTEMPTS = 5;

export type LoginChallenge = {
  id: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
};

export async function createLoginChallenge(env: Env, userId: string): Promise<LoginChallenge> {
  const id = crypto.randomUUID();
  const createdAt = Date.now();
  const expiresAt = createdAt + CHALLENGE_TTL_MS;

  // A user should only have one live challenge at a time.
  await env.DB.prepare("DELETE FROM login_challenges WHERE user_id = ?").bind(userId).run();

  await env.DB.prepare(
    `INSERT INTO login_challenges (id, user_id, created_at, expires_at, attempts)
     VALUES (?, ?, ?, ?, 0)`,
  ).bind(id, userId, createdAt, expiresAt).run();

  return { id, userId, createdAt, expiresAt, attempts: 0 };
}

/**
 * Looks up a challenge by id. Expired challenges are deleted and treated as
 * not found. Does not consume the challenge.
 */
export async function getLoginChallenge(env: Env, challengeId: string): Promise<LoginChallenge | null> {
  const row = await env.DB.prepare(
    `SELECT id, user_id, created_at, expires_at, attempts FROM login_challenges WHERE id = ?`,
  ).bind(challengeId).first<Record<string, unknown>>();

  if (!row) return null;

  const expiresAt = Number(row.expires_at);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    await deleteLoginChallenge(env, challengeId);
    return null;
  }

  return {
    id: String(row.id),
    userId: String(row.user_id),
    createdAt: Number(row.created_at),
    expiresAt,
    attempts: Number(row.attempts) || 0,
  };
}

export async function recordFailedChallengeAttempt(env: Env, challengeId: string): Promise<void> {
  await env.DB.prepare("UPDATE login_challenges SET attempts = attempts + 1 WHERE id = ?").bind(challengeId).run();
}

export function challengeAttemptsExceeded(challenge: LoginChallenge): boolean {
  return challenge.attempts >= MAX_CHALLENGE_ATTEMPTS;
}

export async function deleteLoginChallenge(env: Env, challengeId: string): Promise<void> {
  await env.DB.prepare("DELETE FROM login_challenges WHERE id = ?").bind(challengeId).run();
}
