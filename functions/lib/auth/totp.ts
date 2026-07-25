import * as OTPAuth from "otpauth";
import QRCode from "qrcode";

const ISSUER = "CO Springs Community Service";
const DIGITS = 6;
const PERIOD = 30;
// Number of 30s steps of clock drift to tolerate on either side.
const VALIDATION_WINDOW = 1;

/** Generates a new random base32 TOTP secret (not yet persisted). */
export function generateTotpSecret(): OTPAuth.Secret {
  return new OTPAuth.Secret({ size: 20 });
}

function buildTotp(secretBase32: string, accountLabel: string): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    issuer: ISSUER,
    label: accountLabel,
    algorithm: "SHA1",
    digits: DIGITS,
    period: PERIOD,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  });
}

/** Builds the otpauth:// URI used to seed authenticator apps. */
export function buildOtpauthUri(secretBase32: string, accountLabel: string): string {
  return buildTotp(secretBase32, accountLabel).toString();
}

/** Renders an otpauth:// URI as an inline SVG QR code data URL (no canvas — Workers-safe). */
export async function generateQrCodeDataUrl(otpauthUri: string): Promise<string> {
  const svg = await QRCode.toString(otpauthUri, {
    type: "svg",
    margin: 1,
    width: 240,
  });
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Verifies a user-submitted 6-digit code against a secret.
 * Returns true if the code is valid within the allowed clock-drift window.
 */
export function verifyTotpCode(secretBase32: string, accountLabel: string, token: string): boolean {
  const cleanToken = token.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(cleanToken)) return false;

  const totp = buildTotp(secretBase32, accountLabel);
  const delta = totp.validate({ token: cleanToken, window: VALIDATION_WINDOW });
  return delta !== null;
}
