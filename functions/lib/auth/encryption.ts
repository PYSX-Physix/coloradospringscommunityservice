// AES-256-GCM encryption for data that must never touch D1 in plaintext
// (currently: TOTP secrets). The key comes from the TWO_FACTOR_ENCRYPTION_KEY
// Wrangler secret — never hardcode it, never log it, never fall back to a
// default value if it's missing.

const IV_BYTES = 12; // 96-bit IV, standard for AES-GCM

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function importKey(rawKey: string): Promise<CryptoKey> {
  if (!rawKey) {
    throw new Error("TWO_FACTOR_ENCRYPTION_KEY is not configured");
  }

  // The secret is expected to be a base64-encoded 32-byte (256-bit) key,
  // e.g. generated with: openssl rand -base64 32
  let keyBytes: Uint8Array;
  try {
    keyBytes = base64ToBytes(rawKey);
  } catch {
    throw new Error("TWO_FACTOR_ENCRYPTION_KEY is not valid base64");
  }

  if (keyBytes.length !== 32) {
    throw new Error("TWO_FACTOR_ENCRYPTION_KEY must decode to exactly 32 bytes");
  }

  return crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

/** Encrypts a plaintext string, returning a single base64 token of iv || ciphertext. */
export async function encryptSecret(plaintext: string, encryptionKey: string): Promise<string> {
  const key = await importKey(encryptionKey);
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);

  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return bytesToBase64(combined);
}

/** Decrypts a token produced by encryptSecret back into the original plaintext string. */
export async function decryptSecret(token: string, encryptionKey: string): Promise<string> {
  const key = await importKey(encryptionKey);
  const combined = base64ToBytes(token);

  if (combined.length <= IV_BYTES) {
    throw new Error("Invalid encrypted payload");
  }

  const iv = combined.slice(0, IV_BYTES);
  const ciphertext = combined.slice(IV_BYTES);

  const plaintextBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return new TextDecoder().decode(plaintextBuffer);
}
