import { getSession } from "../../../lib/auth";
import { corsJson } from "../../../lib/cors";
import { rateLimit } from "../../../lib/rateLimit";
import { encryptSecret } from "../../../lib/auth/encryption";
import { generateTotpSecret, buildOtpauthUri, generateQrCodeDataUrl } from "../../../lib/auth/totp";

interface Env {
  DB: D1Database;
  Rate_Limits?: KVNamespace;
  TWO_FACTOR_ENCRYPTION_KEY: string;
}

// POST /api/auth/2fa/setup — begin enabling 2FA.
// Generates a secret, stores it encrypted (but NOT yet enabled), and
// returns a QR code + manual-entry key. The user must confirm with a valid
// code via /api/auth/2fa/verify before 2FA actually turns on.
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  const limitResponse = await rateLimit(request, env, {
    limit: 10,
    window: 3600,
    keyPrefix: "2fa-setup",
  });
  if (limitResponse) return limitResponse;

  try {
    const session = await getSession(env, request);
    if (!session) {
      return corsJson(request, { error: "Not authenticated" }, 401);
    }

    if (session.user.twoFactorEnabled) {
      return corsJson(request, { error: "Two-factor authentication is already enabled" }, 400);
    }

    if (!env.TWO_FACTOR_ENCRYPTION_KEY) {
      console.error("TWO_FACTOR_ENCRYPTION_KEY is not configured");
      return corsJson(request, { error: "Internal server error" }, 500);
    }

    const secret = generateTotpSecret();
    const secretBase32 = secret.base32;
    const encryptedSecret = await encryptSecret(secretBase32, env.TWO_FACTOR_ENCRYPTION_KEY);

    await env.DB.prepare(
      `UPDATE user SET two_factor_secret = ? WHERE id = ?`,
    ).bind(encryptedSecret, session.user.id).run();

    const otpauthUrl = buildOtpauthUri(secretBase32, session.user.email);
    const qrCode = await generateQrCodeDataUrl(otpauthUrl);

    return corsJson(request, {
      qrCode,
      secret: secretBase32,
      otpauthUrl,
    });
  } catch (error) {
    console.error("2FA setup error", error);
    return corsJson(request, { error: "Internal server error" }, 500);
  }
}
